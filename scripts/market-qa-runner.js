const SUITES = {
  stock: [
    ['stock-plus-1', 'sh600000', 101, 'flat', 'idle'],
    ['stock-plus-3', 'sh600000', 103, 'up', 'celebration_dance'],
    ['stock-plus-7', 'sh600000', 107, 'strong_up', 'jumping'],
    ['stock-strong-up-to-up', 'sh600000', 103, 'up', 'celebration_dance'],
    ['stock-minus-3', 'sh600000', 97, 'down', 'failed'],
    ['stock-minus-7', 'sh600000', 93, 'strong_down', 'crying'],
    ['stock-strong-down-to-down', 'sh600000', 97, 'down', 'failed']
  ],
  'no-restart': [
    ['index-up-1', 'sh000001', 101, 'up', 'celebration_dance'],
    ['index-up-1-1', 'sh000001', 101.1, 'up', 'celebration_dance'],
    ['index-up-0-9', 'sh000001', 100.9, 'up', 'celebration_dance'],
    ['index-up-1-4', 'sh000001', 101.4, 'up', 'celebration_dance'],
    ['index-strong-up-2-1', 'sh000001', 102.1, 'strong_up', 'jumping'],
    ['index-strong-up-2-5', 'sh000001', 102.5, 'strong_up', 'jumping'],
    ['index-strong-up-2-2', 'sh000001', 102.2, 'strong_up', 'jumping'],
    ['index-strong-up-3', 'sh000001', 103, 'strong_up', 'jumping'],
    ['index-strong-down-3-2', 'sh000001', 96.8, 'strong_down', 'crying'],
    ['index-strong-down-3-1', 'sh000001', 96.9, 'strong_down', 'crying'],
    ['index-strong-down-4', 'sh000001', 96, 'strong_down', 'crying'],
    ['index-strong-down-3-2-again', 'sh000001', 96.8, 'strong_down', 'crying']
  ],
  'symbol-switch': [
    ['switch-index', 'sh000001', 101, 'up', 'celebration_dance'],
    ['switch-stock', 'sh600000', 101, 'flat', 'idle'],
    ['switch-index-again', 'sh000001', 101, 'up', 'celebration_dance']
  ],
  index: [
    ['index-up', 'sh000001', 101, 'up', 'celebration_dance'],
    ['index-strong-up', 'sh000001', 102.5, 'strong_up', 'jumping'],
    ['index-flat', 'sh000001', 100, 'flat', 'idle'],
    ['index-down', 'sh000001', 97.01, 'down', 'failed'],
    ['index-strong-down', 'sh000001', 97, 'strong_down', 'crying']
  ],
  'time-priority': [
    ['time-market-before-sleep', 'sh000001', 102.5, 'strong_up', 'jumping']
  ]
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const holdMs = Math.max(1200, Number(process.env.NIULAI_MARKET_QA_HOLD_MS) || 1600);

function log(event, data = {}) {
  console.log('[MARKET_QA]', event, JSON.stringify(data));
}

function assertSequenceIncrement(before, after, assertion, step) {
  const pass = after > before;
  log(pass ? 'ASSERT_PASS' : 'ASSERT_FAIL', { step, assertion, before, after });
  return pass;
}

async function runStep(win, [id, symbol, price, expectedState, expectedAction]) {
  const input = { symbol, prevClose: 100, price };
  log('STEP_START', { step: id, ...input });
  const decisionSnapshot = await win.webContents.executeJavaScript(`(() => {
    window.__niulaiMarketQA.pushQuote(${JSON.stringify(input)});
    return window.__niulaiMarketQA.snapshot();
  })()`);
  const actual = {
    instrumentType: decisionSnapshot.instrumentType,
    marketState: decisionSnapshot.marketState,
    currentAction: decisionSnapshot.currentAction,
    priority: decisionSnapshot.currentActionPriority,
    category: decisionSnapshot.currentActionCategory,
    playbackSequenceId: decisionSnapshot.playbackSequenceId,
    currentSymbol: decisionSnapshot.currentSymbol
  };
  const pass = actual.marketState === expectedState && actual.currentAction === expectedAction;
  log('DECISION_SNAPSHOT', { suite: process.env.NIULAI_MARKET_QA_SUITE, step: id, ...input, changePct: price - 100, expected: { marketState: expectedState, action: expectedAction }, actual, pass });
  if (!pass) log('ASSERT_FAIL', { step: id, expected: { marketState: expectedState, action: expectedAction }, actual });
  else log('ASSERT_PASS', { step: id });
  await sleep(holdMs);
  const postHoldSnapshot = await win.webContents.executeJavaScript('window.__niulaiMarketQA.snapshot()');
  log('POST_HOLD_SNAPSHOT', {
    step: id,
    currentAction: postHoldSnapshot.currentAction,
    frameIndex: postHoldSnapshot.playback.frameIndex,
    playbackSequenceId: postHoldSnapshot.playbackSequenceId
  });
  return { pass, decisionSnapshot, postHoldSnapshot, actual, expectedState, expectedAction, id };
}

async function runSuite(win, suiteName) {
  const steps = SUITES[suiteName];
  if (!steps) return true;
  log('SUITE_START', { suite: suiteName });
  let allPass = true;
  const results = [];
  for (const step of steps) {
    const result = await runStep(win, step);
    results.push(result);
    allPass = allPass && result.pass;
  }
  if (suiteName === 'stock') {
    const transitions = [
      ['stock-strong-up-to-up', 'stock-strong-up-to-up-sequence-id-increment'],
      ['stock-strong-down-to-down', 'stock-strong-down-to-down-sequence-id-increment']
    ];
    for (const [stepId, assertion] of transitions) {
      const index = results.findIndex(result => result.id === stepId);
      const prior = results[index - 1];
      const current = results[index];
      const incremented = assertSequenceIncrement(
        prior.decisionSnapshot.playbackSequenceId,
        current.decisionSnapshot.playbackSequenceId,
        assertion,
        stepId
      );
      allPass = allPass && incremented;
    }
  }
  if (suiteName === 'no-restart') {
    for (let i = 1; i < results.length; i++) {
      const prior = results[i - 1];
      const current = results[i];
      if (prior.expectedState === current.expectedState && prior.expectedAction === current.expectedAction) {
        const stable = prior.decisionSnapshot.playbackSequenceId === current.decisionSnapshot.playbackSequenceId;
        log(stable ? 'ASSERT_PASS' : 'ASSERT_FAIL', { step: current.id, assertion: 'same-action-sequence-id-stable', before: prior.decisionSnapshot.playbackSequenceId, after: current.decisionSnapshot.playbackSequenceId });
        allPass = allPass && stable;
      } else if (prior.expectedAction !== current.expectedAction) {
        const incremented = current.decisionSnapshot.playbackSequenceId > prior.decisionSnapshot.playbackSequenceId;
        log(incremented ? 'ASSERT_PASS' : 'ASSERT_FAIL', { step: current.id, assertion: 'action-transition-sequence-id-increment', before: prior.decisionSnapshot.playbackSequenceId, after: current.decisionSnapshot.playbackSequenceId });
        allPass = allPass && incremented;
      }
    }
  }
  log('SUITE_COMPLETE', { suite: suiteName, pass: allPass });
  return allPass;
}

async function run(win) {
  const suiteName = process.env.NIULAI_MARKET_QA_SUITE || 'all';
  const persisted = await win.webContents.executeJavaScript("({ currentSymbol: localStorage.getItem('niulai.currentSymbol.v1'), lowProfile: localStorage.getItem('niulai.lowProfile.v1') })");
  await win.webContents.executeJavaScript("window.__niulaiMarketQA.configure({ timePreset: 'am-trading', lowProfile: false })");
  const initial = await win.webContents.executeJavaScript('window.__niulaiMarketQA.snapshot()');
  log('QA_ENABLED', { suite: suiteName, initial });
  let pass = true;
  const names = suiteName === 'all' ? ['stock', 'no-restart', 'symbol-switch', 'time-priority'] : [suiteName];
  try {
    for (const name of names) {
      pass = (await runSuite(win, name)) && pass;
      if (name === 'time-priority') {
        await win.webContents.executeJavaScript("window.__niulaiMarketQA.setTimePreset('weekend')");
        await sleep(400);
        const sleeping = await win.webContents.executeJavaScript('window.__niulaiMarketQA.snapshot()');
        const sleepPass = sleeping.currentAction === 'sleep' && sleeping.restMode === true;
        log(sleepPass ? 'ASSERT_PASS' : 'ASSERT_FAIL', { step: 'time-weekend-sleep', expected: { action: 'sleep', restMode: true }, actual: { action: sleeping.currentAction, restMode: sleeping.restMode } });
        pass = pass && sleepPass;
        await win.webContents.executeJavaScript("window.__niulaiMarketQA.setTimePreset('am-trading')");
        await sleep(400);
        const restored = await win.webContents.executeJavaScript('window.__niulaiMarketQA.snapshot()');
        const restorePass = restored.currentAction === 'jumping' && restored.restMode === false;
        log(restorePass ? 'ASSERT_PASS' : 'ASSERT_FAIL', { step: 'time-trading-restore', assertion: 'time-priority-restore-action', expected: { action: 'jumping', restMode: false }, actual: { action: restored.currentAction, restMode: restored.restMode } });
        pass = pass && restorePass;
      }
    }
    log('SUITE_COMPLETE', { suite: suiteName, pass });
    await sleep(Math.max(0, Number(process.env.NIULAI_MARKET_QA_HOLD_MS) || 1600));
    return pass;
  } finally {
    await win.webContents.executeJavaScript(`(() => {
      const restore = ${JSON.stringify(persisted)};
      if (restore.currentSymbol === null) localStorage.removeItem('niulai.currentSymbol.v1');
      else localStorage.setItem('niulai.currentSymbol.v1', restore.currentSymbol);
      if (restore.lowProfile === null) localStorage.removeItem('niulai.lowProfile.v1');
      else localStorage.setItem('niulai.lowProfile.v1', restore.lowProfile);
    })()`);
    log('PERSISTED_SETTINGS_RESTORED', { currentSymbol: persisted.currentSymbol, lowProfile: persisted.lowProfile });
  }
}

module.exports = { run };
