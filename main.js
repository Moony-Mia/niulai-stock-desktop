const { app, BrowserWindow, Tray, Menu, nativeImage, globalShortcut, ipcMain, screen, powerMonitor } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

// 主进程级崩溃兜底：写日志 + 弹系统错误框，避免“窗口蹦一下就没了”却无线索
function bootLog(line) {
  try { fs.appendFileSync(path.join(__dirname, 'renderer-console.log'), `[${new Date().toISOString()}] ${line}\n`); } catch (e) {}
}
process.on('uncaughtException', (e) => {
  bootLog('[MAIN-CRASH] ' + (e && e.stack || e));
  try { require('electron').dialog.showErrorBox('牛来(主进程)出错', String((e && e.stack) || e)); } catch (_) {}
});
process.on('unhandledRejection', (e) => {
  bootLog('[MAIN-REJECT] ' + ((e && e.stack) || e));
});
const http = require('http');
const https = require('https');
const net = require('net');
const { URL } = require('url');

let win = null;
let tray = null;
const marketQaEnabled = !app.isPackaged && process.env.NIULAI_MARKET_QA === '1';
const alertQaEnabled = !app.isPackaged && process.env.NIULAI_ALERT_QA === '1' && !marketQaEnabled;
let currentSymbol = 'sh000001'; // 上证指数
let feedTimer = null;
let consecutiveFeedFailures = 0;
let lastFeedSuccessAt = 0;
let lastFeedAttemptAt = 0;
let lastFeedRequestMs = 0;
let lastFeedError = '';
let lastFeedTransport = '';
let lastSearchError = '';
let currentFeedDelay = 5000;
let updaterReady = false;
// PER-10: 透明桌宠窗口锚点与鼠标命中状态
let resizeAnchor = null;
let mouseInteractive = true;

const INDEX_NAMES = {
  'sh000001': '上证指数',
  'sz399001': '深证成指',
  'sh000688': '科创50',
  'sh000300': '沪深300',
  'sh000016': '上证50',
  'sh000905': '中证500',
  'int_nasdaq': '纳斯达克',
  'int_dji': '道琼斯',
  'int_sp500': '标普500',
};

function createWindow() {
  win = new BrowserWindow({
    width: 400,
    height: 520,
    transparent: true,
    backgroundColor: '#00000000',
    frame: false,
    thickFrame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // 把渲染层 console 和报错写到日志，方便定位“窗口弹了但牛没出来”这类问题
  const logPath = path.join(__dirname, 'renderer-console.log');
  const fs = require('fs');
  function logRender(line) {
    try { fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${line}\n`); } catch (e) {}
  }
  // 启动时强制创建日志文件，保证一定有落点可查
  try { fs.writeFileSync(logPath, `[boot] main.js createWindow @ ${new Date().toISOString()}\n`); } catch (e) {}
  win.webContents.on('console-message', (e, level, message, line, sourceId) => {
    const lv = ['debug', 'log', 'warn', 'error'][level] || level;
    logRender(`[console:${lv}] ${message}`);
  });
  win.webContents.on('did-fail-load', (e, code, desc, url) => {
    logRender(`[did-fail-load] ${code} ${desc} ${url}`);
  });

  // PER-10: 默认允许牛和 HUD 接收鼠标，透明区域由 renderer 根据命中区域切换穿透。
  win.setIgnoreMouseEvents(false);

  const qaEnabled = marketQaEnabled;
  const qaQuery = qaEnabled ? { niulaiQa: '1' } : alertQaEnabled ? { niulaiAlertQa: '1' } : undefined;
  win.loadFile(path.join(__dirname, 'niulai-ticker.html'), qaQuery ? { query: qaQuery } : undefined);

  win.webContents.on('did-finish-load', () => {
    logRender('[boot] page did-finish-load OK, visible=' + win.isVisible());
    win.webContents.executeJavaScript('window.__inElectron = true; if (typeof window.__setSimulated === "function") window.__setSimulated(false); if (typeof window.reportSize === "function") window.reportSize(); typeof window.__getCurrentSymbol === "function" ? window.__getCurrentSymbol() : null;')
      .then((rendererSymbol) => {
        const normalized = normalizeAshareSymbol(rendererSymbol);
        if (normalized) currentSymbol = normalized;
        if (!qaEnabled && !alertQaEnabled) startMarketFeed();
      })
      .catch((e) => { bootLog('[boot] renderer symbol handoff failed: ' + e.message); if (!qaEnabled && !alertQaEnabled) startMarketFeed(); });
    if (qaEnabled) {
      const runner = require('./scripts/market-qa-runner');
      runner.run(win).then(pass => setTimeout(() => app.exit(pass ? 0 : 1), 0)).catch(error => {
        console.error('[MARKET_QA] RUNNER_ERROR', error);
        app.exit(1);
      });
    } else if (alertQaEnabled) {
      const runner = require('./scripts/watch-alert-qa-runner');
      runner.run(win).then(pass => setTimeout(() => app.exit(pass ? 0 : 1), 0)).catch(error => {
        console.error('[WATCH_ALERT_QA] RUNNER_ERROR', error);
        app.exit(1);
      });
    }
  });

  win.webContents.on('did-fail-load', (e, code, desc, url) => {
    logRender(`[did-fail-load] ${code} ${desc} ${url}`);
  });

  // 渲染进程崩溃：弹系统错误框 + 写日志，避免窗口“蹦一下就没了”却无任何线索
  win.webContents.on('crashed', () => {
    const msg = '[CRASH] 渲染进程崩溃（renderer crashed）';
    logRender(msg);
    try { require('electron').dialog.showErrorBox('牛来出错', '渲染进程崩溃，详见 desktop-pet\\renderer-console.log'); } catch (e) {}
  });
  app.on('render-process-gone', (event, webContents, details) => {
    const msg = `[render-process-gone] reason=${details.reason} exited=${details.exitCode}`;
    logRender(msg);
    try { require('electron').dialog.showErrorBox('牛来出错', '渲染进程异常退出：' + details.reason + '（详见 renderer-console.log）'); } catch (e) {}
  });

  win.on('closed', () => { win = null; });
}

function setupAutoUpdater() {
  if (!app.isPackaged || updaterReady) return;
  updaterReady = true;
  // 只提示发现新版本；用户点击“下载更新”后才开始下载。
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  win?.webContents.send('updater-status', { state: 'checking' });
  autoUpdater.on('update-available', info => win?.webContents.send('updater-status', { state: 'available', version: info.version }));
  autoUpdater.on('update-not-available', info => win?.webContents.send('updater-status', { state: 'latest', version: info.version }));
  autoUpdater.on('download-progress', info => win?.webContents.send('updater-status', { state: 'downloading', percent: Math.round(info.percent) }));
  autoUpdater.on('update-downloaded', info => win?.webContents.send('updater-status', { state: 'downloaded', version: info.version }));
  autoUpdater.on('error', error => { bootLog('[UPDATER] ' + (error?.message || error)); win?.webContents.send('updater-status', { state: 'error' }); });
  autoUpdater.checkForUpdates().catch(error => bootLog('[UPDATER-CHECK] ' + (error?.message || error)));
}

ipcMain.on('updater-download', () => { if (app.isPackaged) autoUpdater.downloadUpdate().catch(error => bootLog('[UPDATER-DOWNLOAD] ' + error.message)); });
ipcMain.on('updater-check', () => {
  if (!app.isPackaged) return;
  win?.webContents.send('updater-status', { state: 'checking' });
  autoUpdater.checkForUpdates().catch(error => bootLog('[UPDATER-CHECK-MANUAL] ' + error.message));
});
ipcMain.on('updater-install', () => { if (app.isPackaged) autoUpdater.quitAndInstall(); });

function sinaUrl(symbol) {
  // 美股特殊处理：这里仅保留接口占位，Sina 美股接口不稳定，可用备用源替换
  if (symbol.startsWith('int_')) return null;
  return `https://hq.sinajs.cn/list=${symbol}`;
}

const SINA_HEADERS = {
  'Referer': 'https://finance.sina.com.cn',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

// 解析出网代理：优先 NIULAI_PROXY 环境变量，否则默认本机 7890（与公司网络一致）
function resolveProxy() {
  if (process.env.NIULAI_PROXY) return process.env.NIULAI_PROXY;
  return 'http://127.0.0.1:7890';
}

// 经 HTTP 代理发 HTTPS 请求：CONNECT 隧道 + TLS。零依赖，适配 Electron 主进程（Node fetch 不读系统代理）
function proxyGet(targetUrl, proxyUrl) {
  return new Promise((resolve, reject) => {
    const t = new URL(targetUrl);
    const p = new URL(proxyUrl);
    const connectReq = http.request({
      host: p.hostname,
      port: Number(p.port) || 80,
      method: 'CONNECT',
      path: `${t.hostname}:${t.port || 443}`,
      timeout: 8000,
    });
    connectReq.on('connect', (res, socket) => {
      if (res.statusCode !== 200) { socket.destroy(); return reject(new Error('proxy CONNECT ' + res.statusCode)); }
      const req = https.request({
        host: t.hostname,
        port: t.port || 443,
        path: t.pathname + t.search,
        method: 'GET',
        headers: SINA_HEADERS,
        socket,
        agent: false,
        timeout: 8000,
      }, (resp) => {
        const chunks = [];
        resp.on('data', c => chunks.push(c));
        resp.on('end', () => resolve(Buffer.concat(chunks)));
      });
      req.on('timeout', () => req.destroy(new Error('quote timeout')));
      req.on('error', reject);
      req.end();
    });
    connectReq.on('timeout', () => connectReq.destroy(new Error('proxy timeout')));
    connectReq.on('error', reject);
    connectReq.end();
  });
}

async function directGet(targetUrl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const resp = await fetch(targetUrl, { headers: SINA_HEADERS, signal: controller.signal });
    if (!resp.ok) throw new Error(`direct HTTP ${resp.status}`);
    return Buffer.from(await resp.arrayBuffer());
  } finally {
    clearTimeout(timer);
  }
}

async function fetchBuffer(targetUrl, label = 'request') {
  const proxy = resolveProxy();
  try {
    return { buf: await proxyGet(targetUrl, proxy), transport: 'proxy' };
  } catch (pe) {
    console.warn(`[${label}] 经代理失败，回落直连:`, pe.message);
    return { buf: await directGet(targetUrl), transport: 'direct' };
  }
}

function parseSina(buf, symbol) {
  const text = new TextDecoder('gbk').decode(buf);
  const re = new RegExp(`var hq_str_${symbol}="([^"]*)";`);
  const m = text.match(re);
  if (!m) return null;
  const parts = m[1].split(',');
  if (parts.length < 4) return null;
  const name = parts[0] || INDEX_NAMES[symbol];
  const prevClose = parseFloat(parts[2]);
  const current = parseFloat(parts[3]);
  if (isNaN(current) || isNaN(prevClose) || prevClose === 0) return null;
  return {
    symbol,
    name,
    price: current,
    prevClose,
    quoteDate: parts[30] || '',
    quoteTime: parts[31] || '',
  };
}

function parseSinaBatch(buf, symbols) {
  const text = new TextDecoder('gbk').decode(buf || Buffer.alloc(0));
  const wanted = new Set(symbols);
  const quotes = [];
  for (const symbol of wanted) {
    const match = text.match(new RegExp(`var hq_str_${symbol}="([^"]*)";`));
    if (!match) continue;
    const parts = match[1].split(',');
    if (parts.length < 4) continue;
    const prevClose = parseFloat(parts[2]);
    const price = parseFloat(parts[3]);
    if (!Number.isFinite(price) || !Number.isFinite(prevClose) || prevClose === 0) continue;
    quotes.push({ symbol, name: parts[0] || INDEX_NAMES[symbol] || symbol, price, prevClose, quoteDate: parts[30] || '', quoteTime: parts[31] || '' });
  }
  return quotes;
}

function normalizeAshareSymbol(raw) {
  if (!raw) return null;
  let s = String(raw).trim().toLowerCase().replace(/\s+/g, '').replace(/\./g, '');
  const suffix = s.match(/^(\d{6})(sh|sz)$/);
  if (suffix) return suffix[2] + suffix[1];
  if (/^(sh|sz)\d{6}$/.test(s)) return s;
  if (/^\d{6}$/.test(s)) return (s[0] === '6' ? 'sh' : 'sz') + s;
  return null;
}

function parseSinaSuggest(buf) {
  const text = new TextDecoder('gbk').decode(buf || Buffer.alloc(0));
  const m = text.match(/="([\s\S]*?)";?\s*$/);
  if (!m || !m[1]) return [];
  const rows = m[1].split(';').map(v => v.trim()).filter(Boolean);
  const out = [];
  const seen = new Set();
  for (const row of rows) {
    const parts = row.split(',').map(v => v.trim());
    const symbol = parts.find(v => /^(sh|sz)\d{6}$/i.test(v));
    if (!symbol) continue;
    const sym = symbol.toLowerCase();
    if (seen.has(sym)) continue;
    let name = parts[4] || '';
    if (!name || /^(sh|sz)?\d{6}$/i.test(name)) {
      name = parts.find(v => v && v !== symbol && !/^\d+$/.test(v) && !/^(sh|sz)\d{6}$/i.test(v)) || sym;
    }
    seen.add(sym);
    out.push({ symbol: sym, name });
    if (out.length >= 12) break;
  }
  return out;
}

async function searchSymbols(keyword) {
  const q = String(keyword || '').trim().slice(0, 40);
  lastSearchError = '';
  if (!q) return [];
  const url = `https://suggest3.sinajs.cn/suggest/type=11,12,13,14,15&key=${encodeURIComponent(q)}&name=suggestvalue`;
  try {
    const { buf } = await fetchBuffer(url, 'searchSymbols');
    let results = parseSinaSuggest(buf);
    if (!results.length) {
      const exact = normalizeAshareSymbol(q);
      if (exact) {
        const quote = await fetchIndex(exact);
        if (quote) results = [{ symbol: exact, name: quote.name || exact }];
      }
    }
    return results.slice(0, 8);
  } catch (e) {
    lastSearchError = e && e.message ? e.message : String(e);
    console.warn('[searchSymbols] failed:', lastSearchError);
    return [];
  }
}

async function fetchIndex(symbol) {
  const url = sinaUrl(symbol);
  if (!url) return { symbol, name: INDEX_NAMES[symbol] || symbol, price: 0, prevClose: 1, quoteDate: '', quoteTime: '', transport: 'none' };
  try {
    const { buf, transport } = await fetchBuffer(url, 'fetchIndex');
    if (!buf) throw new Error('empty response');
    const parsed = parseSina(buf, symbol);
    if (!parsed) throw new Error('invalid quote payload');
    lastFeedError = '';
    return { ...parsed, transport };
  } catch (e) {
    lastFeedError = e && e.message ? e.message : String(e);
    console.error('fetchIndex error:', lastFeedError);
    return null;
  }
}

function parseMiniKlineBars(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map(item => {
    const day = typeof item?.day === 'string' ? item.day : '';
    const open = Number(item?.open), high = Number(item?.high), low = Number(item?.low), close = Number(item?.close);
    if (!day || !Number.isFinite(open) || !Number.isFinite(high) || !Number.isFinite(low) || !Number.isFinite(close)) return null;
    if (high < open || high < close || low > open || low > close || high < low) return null;
    return { day, open, high, low, close, volume: Number.isFinite(Number(item?.volume)) ? Number(item.volume) : null };
  }).filter(Boolean);
}

async function fetchMiniKlineHistory(symbol) {
  if (!/^(sh|sz)\d{6}$/.test(String(symbol || '').toLowerCase())) return { symbol, bars: [], supported: false };
  const url = `https://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData?symbol=${encodeURIComponent(symbol)}&scale=5&ma=no&datalen=30`;
  try {
    const { buf, transport } = await fetchBuffer(url, 'fetchMiniKlineHistory');
    const raw = JSON.parse(new TextDecoder('utf-8').decode(buf || Buffer.alloc(0)));
    return { symbol, bars: parseMiniKlineBars(raw), supported: true, transport };
  } catch (e) {
    console.warn('[fetchMiniKlineHistory] failed:', e?.message || e);
    return { symbol, bars: [], supported: true, error: e?.message || String(e) };
  }
}

function getAshareFeedPhase(d = new Date()) {
  const day = d.getDay();
  if (day === 0 || day === 6) return 'weekend';
  const m = d.getHours() * 60 + d.getMinutes();
  if ((m >= 570 && m < 690) || (m >= 780 && m < 900)) return 'trading';
  if ((m >= 555 && m < 570) || (m >= 765 && m < 780)) return 'preopen';
  if (m >= 690 && m < 765) return 'lunch';
  if (m >= 900 && m < 1035) return 'postclose';
  return 'closed';
}

function computeFeedDelay(now = new Date(), failures = consecutiveFeedFailures) {
  if (failures > 0) return [5000, 10000, 20000, 30000][Math.min(failures - 1, 3)];
  const phase = getAshareFeedPhase(now);
  if (phase === 'trading') return 5000;
  if (phase === 'preopen') return 10000;
  if (phase === 'lunch') return 30000;
  if (phase === 'postclose') return 60000;
  return 180000;
}

function pushMarket(data) {
  if (!win) return;
  const payload = {
    symbol: data.symbol || currentSymbol,
    name: data.name,
    price: data.price,
    prevClose: data.prevClose,
    quoteDate: data.quoteDate || '',
    quoteTime: data.quoteTime || '',
    receivedAt: data.receivedAt || new Date().toISOString(),
    requestMs: Number(data.requestMs) || 0,
    transport: data.transport || lastFeedTransport || '',
  };
  try {
    win.webContents.executeJavaScript(`window.__pushMarket(${JSON.stringify(payload)});`);
  } catch (e) {
    console.error('pushMarket error:', e.message);
  }
}

function pushFeedStatus(extra = {}) {
  if (!win || win.isDestroyed()) return;
  const payload = {
    state: extra.state || (consecutiveFeedFailures >= 3 ? 'offline' : consecutiveFeedFailures ? 'reconnecting' : 'online'),
    consecutiveFailures: consecutiveFeedFailures,
    lastSuccessAt: lastFeedSuccessAt || null,
    lastAttemptAt: lastFeedAttemptAt || null,
    requestMs: lastFeedRequestMs || 0,
    nextRefreshMs: Number(extra.nextRefreshMs ?? currentFeedDelay) || 0,
    transport: lastFeedTransport || '',
    error: lastFeedError || '',
    reason: extra.reason || '',
  };
  win.webContents.executeJavaScript(`window.__pushFeedStatus && window.__pushFeedStatus(${JSON.stringify(payload)});`).catch(() => {});
}

function scheduleFeed(delay) {
  if (feedTimer) clearTimeout(feedTimer);
  currentFeedDelay = Math.max(1000, Number(delay) || 5000);
  feedTimer = setTimeout(() => refreshMarketFeed('timer'), currentFeedDelay);
}

async function refreshMarketFeed(reason = 'manual') {
  if (!win || win.isDestroyed()) return;
  lastFeedAttemptAt = Date.now();
  const started = Date.now();
  const data = await fetchIndex(currentSymbol);
  lastFeedRequestMs = Date.now() - started;
  if (data) {
    consecutiveFeedFailures = 0;
    lastFeedSuccessAt = Date.now();
    lastFeedTransport = data.transport || '';
    const payload = { ...data, receivedAt: new Date().toISOString(), requestMs: lastFeedRequestMs };
    pushMarket(payload);
    const delay = computeFeedDelay(new Date(), 0);
    pushFeedStatus({ state: 'online', nextRefreshMs: delay, reason });
    scheduleFeed(delay);
    return;
  }
  consecutiveFeedFailures += 1;
  const delay = computeFeedDelay(new Date(), consecutiveFeedFailures);
  pushFeedStatus({ state: consecutiveFeedFailures >= 3 ? 'offline' : 'reconnecting', nextRefreshMs: delay, reason });
  scheduleFeed(delay);
}

function startMarketFeed() {
  if (feedTimer) clearTimeout(feedTimer);
  consecutiveFeedFailures = 0;
  refreshMarketFeed('start');
}

ipcMain.on('set-symbol', (event, symbol) => {
  const normalized = normalizeAshareSymbol(symbol) || symbol;
  if (normalized && normalized !== currentSymbol) {
    currentSymbol = normalized;
    console.log('switch symbol ->', currentSymbol);
  }
  if (feedTimer) clearTimeout(feedTimer);
  if (!marketQaEnabled && !alertQaEnabled) refreshMarketFeed('symbol-change');
});

ipcMain.handle('search-symbols', async (_event, keyword) => {
  const results = await searchSymbols(keyword);
  return { results, error: lastSearchError || '' };
});

ipcMain.handle('fetch-watchlist-quotes', async (_event, symbols) => {
  if (marketQaEnabled) return { quotes: [], disabled: true };
  const requested = [...new Set((Array.isArray(symbols) ? symbols : [])
    .map(normalizeAshareSymbol).filter(Boolean))]
    .filter(symbol => symbol !== currentSymbol);
  if (!requested.length) return { quotes: [], disabled: false };
  const url = `https://hq.sinajs.cn/list=${requested.join(',')}`;
  try {
    const started = Date.now();
    const { buf, transport } = await fetchBuffer(url, 'fetchWatchlistQuotes');
    const quotes = parseSinaBatch(buf, requested).map(q => ({ ...q, transport, requestMs: Date.now() - started }));
    return { quotes, failedSymbols: requested.filter(symbol => !quotes.some(q => q.symbol === symbol)) };
  } catch (e) {
    console.warn('[fetchWatchlistQuotes] failed:', e && e.message ? e.message : e);
    return { quotes: [], error: e && e.message ? e.message : String(e) };
  }
});

ipcMain.on('hide-pet', () => {
  if (win && !win.isDestroyed()) win.hide();
});

ipcMain.handle('fetch-mini-kline', async (_event, symbol) => fetchMiniKlineHistory(String(symbol || '').toLowerCase()));

ipcMain.on('close-pet', () => {
  app.quit();
});

// 渲染层手动拖拽：接收绝对屏幕坐标并移动窗口。
// 因为 #petbox 必须设为 no-drag（否则右键事件会被原生拖拽层吞掉），
// 窗口移动改由 JS 用绝对坐标定位经 IPC 下发——左键拖牛身即可移动。
// 用绝对坐标（而非逐帧累加 clientX 增量）可避免高分屏缩放下窗口与光标互相追赶的抖动。
// petBottom 是“牛本体底边”相对当前窗口顶部的像素偏移，用它而不是窗口底边做任务栏约束。
function clampDragToWorkArea(x, y, petBottom, workArea) {
  const nx = Math.round(Number(x) || 0);
  let ny = Math.round(Number(y) || 0);
  const bottomOffset = Math.max(0, Number(petBottom) || 0);
  if (bottomOffset > 0 && workArea) {
    const workBottom = workArea.y + workArea.height;
    ny = Math.min(ny, Math.round(workBottom - bottomOffset));
  }
  return { x: nx, y: ny };
}

ipcMain.on('drag-window', (e, x, y, petBottom) => {
  if (!win) return;
  // 拖拽时以鼠标所在显示器为准；workArea 会自动排除该屏幕的 Windows 任务栏。
  const cursorPoint = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursorPoint);
  const next = clampDragToWorkArea(x, y, petBottom, display.workArea);
  win.setPosition(next.x, next.y);
});

// 根据渲染层内容调整窗口大小，但保持牛所在的屏幕锚点不动。
// 重要：窗口可能为了透明留白而延伸到 workArea 之外，不能再把“整扇窗口”强行夹回工作区，
// 否则牛贴任务栏时一打开侧边设置，窗口扩容就会把牛斜着推向左上。
// 任务栏边界由 drag-window 的 petBottom 规则负责，这里只负责围绕当前中心扩缩。
function computeResizeBounds(currentBounds, requestedWidth, requestedHeight) {
  const width = Math.max(Math.round(Number(requestedWidth) || 0), 160);
  const height = Math.max(Math.round(Number(requestedHeight) || 0), 160);
  const centerX = currentBounds.x + currentBounds.width / 2;
  const centerY = currentBounds.y + currentBounds.height / 2;
  return {
    x: Math.round(centerX - width / 2),
    y: Math.round(centerY - height / 2),
    width,
    height,
  };
}

// PER-10: renderer 提供牛本体锚点，resize 时保持牛的位置不变，而不是保持透明窗口中心。
ipcMain.on('set-resize-anchor', (e, anchor) => {
  if (!anchor) return;
  const x = Number(anchor.x);
  const y = Number(anchor.y);
  if (Number.isFinite(x) && Number.isFinite(y)) {
    resizeAnchor = { x, y };
  }
});

// PER-10: 根据 renderer 状态切换透明区域鼠标穿透。
ipcMain.on('set-mouse-interactive', (e, value) => {
  if (!win || win.isDestroyed()) return;
  mouseInteractive = Boolean(value);
  win.setIgnoreMouseEvents(!mouseInteractive, { forward: true });
});

function computeResizeBoundsWithAnchor(currentBounds, requestedWidth, requestedHeight) {
  const width = Math.max(Math.round(Number(requestedWidth) || 0), 160);
  const height = Math.max(Math.round(Number(requestedHeight) || 0), 160);

  if (resizeAnchor) {
    return {
      x: Math.round(resizeAnchor.x - width / 2),
      y: Math.round(resizeAnchor.y - height / 2),
      width,
      height,
    };
  }

  return computeResizeBounds(currentBounds, width, height);
}

ipcMain.on('resize-to-content', (e, w, h) => {
  if (!win) return;
  const next = computeResizeBoundsWithAnchor(win.getBounds(), w, h);
  win.setBounds(next);
});

function createTray() {
  let icon = nativeImage.createFromPath(path.join(__dirname, 'tray.png'));
  if (icon.isEmpty()) icon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC');
  tray = new Tray(icon);
  const menu = Menu.buildFromTemplate([
    { label: '显示 / 隐藏', click: () => toggle() },
    { type: 'separator' },
    { label: '退出程序', click: () => app.quit() },
  ]);
  tray.setToolTip('牛来看盘神器');
  tray.setContextMenu(menu);
  tray.on('click', () => toggle());
}

function toggle() {
  if (!win) return;
  if (win.isVisible()) win.hide(); else win.show();
}


function toggleTimeSimulator() {
  if (!win || win.isDestroyed()) return;
  if (!win.isVisible()) win.show();
  win.focus();
  win.webContents.executeJavaScript(
    'typeof window.__toggleTimeSimulator === "function" && window.__toggleTimeSimulator()'
  ).catch((e) => bootLog('[shortcut] Ctrl+Shift+T failed: ' + e.message));
}

// 单实例锁：避免多次双击 .bat / 旧进程残留导致多个透明窗口叠加，
// 那种情况下"新代码窗口"和"旧代码窗口"会互相遮挡，表现为面板时好时坏。
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => { if (win) { win.show(); win.focus(); } });

  app.whenReady().then(() => {
    createWindow();
    setTimeout(setupAutoUpdater, 2500);
    createTray();
    globalShortcut.register('CommandOrControl+Shift+P', () => toggle());
    const timeShortcutOK = globalShortcut.register('CommandOrControl+Shift+T', () => toggleTimeSimulator());
    if (!timeShortcutOK) bootLog('[shortcut] Ctrl+Shift+T registration failed');
    powerMonitor.on('resume', () => {
      bootLog('[power] resume -> refresh market');
      if (feedTimer) clearTimeout(feedTimer);
      refreshMarketFeed('resume');
      if (win && !win.isDestroyed()) {
        win.webContents.executeJavaScript('window.__onSystemResume && window.__onSystemResume()').catch(() => {});
      }
    });
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });

  app.on('window-all-closed', () => {});

  app.on('will-quit', () => {
    if (feedTimer) clearTimeout(feedTimer);
    globalShortcut.unregisterAll();
  });
}
