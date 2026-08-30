const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const holdMs = Math.max(1200, Number(process.env.NIULAI_ALERT_QA_HOLD_MS) || 1200);
const log = (event, data = {}) => console.log('[WATCH_ALERT_QA]', event, JSON.stringify(data));

async function api(win, expression) {
  return win.webContents.executeJavaScript(`window.__niulaiWatchAlertQA.${expression}`);
}
function assert(pass, step, expected, actual) {
  log(pass ? 'ASSERT_PASS' : 'ASSERT_FAIL', { step, expected, actual }); return pass;
}
async function push(win, symbol, price, date = '2026-08-31') {
  return api(win, `pushQuote(${JSON.stringify({ symbol, price, prevClose: 100, quoteDate: date, quoteTime: '10:00:00' })})`);
}
async function snapshot(win) { return api(win, 'snapshot()'); }
async function configure(win, currentSymbol = 'sh000001') {
  await api(win, `configure(${JSON.stringify({ currentSymbol, scale: 130, watchlist: [
    { symbol: 'sh000001', name: '上证指数' }, { symbol: 'sh600000', name: '浦发银行' },
    { symbol: 'sz300750', name: '宁德时代' }, { symbol: 'sh000300', name: '沪深300' }, { symbol: 'sz000001', name: '平安银行' }
  ] })})`);
}

async function runLogic(win) {
  log('SUITE_START', { suite: 'logic' }); let pass = true;
  await configure(win);
  const cowBefore = await snapshot(win);
  await push(win, 'sh600000', 108); let s = await snapshot(win);
  pass = assert(s.watchAlerts.sh600000.initialized && s.watchAlerts.sh600000.lastZone === 'strong_up' && !s.watchAlerts.sh600000.pending && !s.headBadgeVisible, 'initial-baseline', 'baseline-only', s) && pass;
  await push(win, 'sh600000', 106); await push(win, 'sh600000', 108); s = await snapshot(win);
  pass = assert(s.watchAlerts.sh600000.pending && s.watchAlerts.sh600000.unseen && s.headBadgeVisible && s.rowMarkers.sh600000, 'normal-to-strong-up', 'alert', s) && pass;
  const before = JSON.stringify(s.watchAlerts.sh600000); await push(win, 'sh600000', 108.5); await push(win, 'sh600000', 109); s = await snapshot(win);
  pass = assert(JSON.stringify(s.watchAlerts.sh600000) === before, 'continuous-same-strong', 'no-new-state', s.watchAlerts.sh600000) && pass;
  await push(win, 'sh600000', 106); await push(win, 'sh600000', 107.5); s = await snapshot(win);
  pass = assert(s.headBadgeVisible && s.watchAlerts.sh600000.pending, 'exit-and-reenter', 'retrigger', s) && pass;
  await push(win, 'sz300750', 94); await push(win, 'sz300750', 92); s = await snapshot(win);
  pass = assert(s.watchAlerts.sz300750.lastZone === 'strong_down' && s.watchAlerts.sz300750.pending, 'normal-to-strong-down', 'alert', s) && pass;
  await push(win, 'sz000001', 108); await push(win, 'sz000001', 106); await push(win, 'sz000001', 92); s = await snapshot(win);
  pass = assert(s.watchAlerts.sz000001.lastZone === 'strong_down' && s.watchAlerts.sz000001.pending, 'opposite-direction', 'new-alert', s) && pass;
  await push(win, 'sh000300', 101.9); await push(win, 'sh000300', 102); s = await snapshot(win);
  pass = assert(s.watchAlerts.sh000300.lastZone === 'strong_up' && s.watchAlerts.sh000300.pending, 'index-strong-up', 'index-alert', s) && pass;
  await push(win, 'sh000300', 97.1); await push(win, 'sh000300', 97); s = await snapshot(win);
  pass = assert(s.watchAlerts.sh000300.lastZone === 'strong_down' && s.watchAlerts.sh000300.pending, 'index-strong-down', 'index-alert', s) && pass;
  await push(win, 'sh600000', 106, '2026-09-01'); s = await snapshot(win);
  pass = assert(!s.watchAlerts.sh600000.pending && !s.watchAlerts.sh600000.unseen && s.watchAlerts.sh600000.initialized && s.watchAlerts.sh600000.lastZone === 'normal' && s.watchAlerts.sh600000.quoteDate === '2026-09-01', 'cross-day-reset', 'old-alert-cleared-and-new-day-baseline', s.watchAlerts.sh600000) && pass;
  const action = cowBefore.currentAction, sequence = cowBefore.playbackSequenceId;
  pass = assert(s.currentAction === action && s.playbackSequenceId === sequence, 'cow-isolation', { action, sequence }, { action: s.currentAction, sequence: s.playbackSequenceId }) && pass;
  log('SUITE_COMPLETE', { suite: 'logic', pass }); return pass;
}

async function runInteraction(win) {
  log('SUITE_START', { suite: 'interaction' }); let pass = true; await configure(win);
  await api(win, 'configure({ currentSymbol: "sh600000", scale: 130, watchlist: [{ symbol: "sh600000", name: "浦发银行" }, { symbol: "sh000001", name: "上证指数" }] })');
  const trustedBefore = await snapshot(win);
  pass = assert(await api(win, 'setCurrentQuote({ symbol: "sh600000", price: 108, prevClose: 100, quoteDate: "2026-08-31", quoteTime: "10:00:00" })') && (await snapshot(win)).lastQuoteSymbol === 'sh600000', 'trusted-current-quote-ownership', 'sh600000', (await snapshot(win)).lastQuoteSymbol) && pass;
  await api(win, 'clickWatchSymbol("sh000001")');
  await push(win, 'sh600000', 108); let trustedBaseline = await snapshot(win);
  pass = assert(trustedBaseline.watchAlerts.sh600000.lastZone === 'strong_up' && !trustedBaseline.watchAlerts.sh600000.pending && !trustedBaseline.watchAlerts.sh600000.unseen && !trustedBaseline.rowMarkers.sh600000 && !trustedBaseline.headBadgeVisible, 'trusted-current-background-baseline', 'strong-background-first-quote-baseline-only', trustedBaseline.watchAlerts.sh600000) && pass;
  await push(win, 'sh600000', 106); let trustedNormal = await snapshot(win);
  pass = assert(trustedNormal.watchAlerts.sh600000.lastZone === 'normal' && !trustedNormal.watchAlerts.sh600000.pending, 'trusted-current-background-normal-reset', 'normal-without-alert', trustedNormal.watchAlerts.sh600000) && pass;
  await push(win, 'sh600000', 108); let trustedReentry = await snapshot(win);
  pass = assert(trustedReentry.watchAlerts.sh600000.pending && trustedReentry.watchAlerts.sh600000.unseen && trustedReentry.rowMarkers.sh600000 && trustedReentry.headBadgeVisible, 'trusted-current-background-reentry', 'alert-after-exit-and-reenter', trustedReentry.watchAlerts.sh600000) && pass;
  pass = assert(trustedReentry.currentAction === trustedBefore.currentAction && trustedReentry.playbackSequenceId === trustedBefore.playbackSequenceId, 'trusted-current-background-cow-isolation', { action: trustedBefore.currentAction, sequence: trustedBefore.playbackSequenceId }, { action: trustedReentry.currentAction, sequence: trustedReentry.playbackSequenceId }) && pass;
  await api(win, 'configure({ currentSymbol: "sh600000", scale: 130, watchlist: [{ symbol: "sh600000", name: "浦发银行" }, { symbol: "sz000001", name: "平安银行" }, { symbol: "sz300750", name: "宁德时代" }] })');
  await api(win, 'setCurrentQuote({ symbol: "sh600000", price: 108, prevClose: 100, quoteDate: "2026-08-31", quoteTime: "10:00:00" })');
  await api(win, 'clickWatchSymbol("sz000001")'); await api(win, 'clickWatchSymbol("sz300750")');
  await push(win, 'sz000001', 108); let fastSwitchBaseline = await snapshot(win);
  pass = assert(fastSwitchBaseline.watchAlerts.sz000001.initialized && fastSwitchBaseline.watchAlerts.sz000001.lastZone === 'strong_up' && !fastSwitchBaseline.watchAlerts.sz000001.pending && !fastSwitchBaseline.headBadgeVisible, 'untrusted-fast-switch-background-baseline', 'first-quote-baseline-only', fastSwitchBaseline.watchAlerts.sz000001) && pass;
  await push(win, 'sz000001', 106); await push(win, 'sz000001', 108); let fastSwitchReentry = await snapshot(win);
  pass = assert(fastSwitchReentry.watchAlerts.sz000001.pending && fastSwitchReentry.watchAlerts.sz000001.unseen && fastSwitchReentry.headBadgeVisible, 'untrusted-fast-switch-background-reentry', 'alert-after-exit-and-reenter', fastSwitchReentry.watchAlerts.sz000001) && pass;
  await push(win, 'sh600000', 106); await push(win, 'sh600000', 108);
  let s = await snapshot(win); const action = s.currentAction, sequence = s.playbackSequenceId;
  await api(win, 'clickHeadBadge()'); s = await snapshot(win);
  pass = assert(s.tickerMenuVisible && !s.headBadgeVisible && s.rowMarkers.sh600000, 'head-click', 'menu-open-and-pending-kept', s) && pass;
  await api(win, 'clickWatchSymbol("sh600000")'); s = await snapshot(win);
  pass = assert(s.currentSymbol === 'sh600000' && !s.rowMarkers.sh600000 && s.currentAction === action && s.playbackSequenceId === sequence, 'select-target', 'target-only-read', s) && pass;
  await push(win, 'sz300750', 106); await push(win, 'sz300750', 108); await api(win, 'clickHeadBadge()'); await api(win, 'clickWatchSymbol("sh600000")');
  s = await snapshot(win); pass = assert(s.rowMarkers.sz300750 && !s.rowMarkers.sh600000, 'multi-symbol-read', 'other-kept', s) && pass;
  await api(win, 'configure({ currentSymbol: "sh000001", scale: 130, watchlist: [{ symbol: "sh000001", name: "上证指数" }, { symbol: "sh600000", name: "浦发银行" }] })');
  await push(win, 'sh600000', 106); await push(win, 'sh600000', 108);
  await win.webContents.executeJavaScript('document.querySelector(\'.watch-row[data-symbol="sh600000"] .watch-remove\').click()'); s = await snapshot(win);
  pass = assert(!s.watchAlerts.sh600000 && !s.rowMarkers.sh600000, 'delete-clears-state', 'removed', s) && pass;
  await win.webContents.executeJavaScript('document.getElementById("undoDelete").click()'); await push(win, 'sh600000', 108); s = await snapshot(win);
  pass = assert(s.watchAlerts.sh600000.initialized && !s.watchAlerts.sh600000.pending && !s.headBadgeVisible, 'undo-rebaseline', 'baseline-only', s.watchAlerts.sh600000) && pass;
  log('SUITE_COMPLETE', { suite: 'interaction', pass }); return pass;
}

async function runVisual(win) {
  log('SUITE_START', { suite: 'visual' }); await configure(win); await push(win, 'sh600000', 106); await push(win, 'sh600000', 108);
  log('VISUAL_HOLD', { holdMs, scales: [80, 130, 160], instruction: '人工检查 badge、动画、菜单、行内 marker 与透明鼠标命中' });
  for (const scale of [80, 130, 160]) { await api(win, `setScale(${scale})`); await sleep(holdMs); log('VISUAL_SNAPSHOT', { scale, snapshot: await snapshot(win) }); }
  log('SUITE_COMPLETE', { suite: 'visual', pass: true, visualRequiresHumanReview: true }); return true;
}

async function run(win) {
  const suite = process.env.NIULAI_ALERT_QA_SUITE || 'all';
  log('QA_ENABLED', { suite }); let pass = true;
  if (suite === 'logic' || suite === 'all') pass = await runLogic(win) && pass;
  if (suite === 'interaction' || suite === 'all') pass = await runInteraction(win) && pass;
  if (suite === 'visual' || suite === 'all') pass = await runVisual(win) && pass;
  log('SUITE_COMPLETE', { suite, pass }); await sleep(holdMs); return pass;
}
module.exports = { run };
