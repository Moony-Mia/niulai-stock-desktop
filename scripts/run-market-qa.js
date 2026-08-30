const { spawn } = require('node:child_process');
const path = require('node:path');

const suite = process.argv.includes('--suite')
  ? process.argv[process.argv.indexOf('--suite') + 1]
  : 'all';
const holdArg = process.argv.includes('--hold')
  ? Number(process.argv[process.argv.indexOf('--hold') + 1])
  : undefined;

if (!['stock', 'no-restart', 'symbol-switch', 'index', 'time-priority', 'all'].includes(suite)) {
  console.error('[MARKET_QA] invalid suite:', suite);
  process.exit(2);
}

const electron = require('electron');
const child = spawn(electron, ['.'], {
  cwd: path.resolve(__dirname, '..'),
  env: {
    ...process.env,
    NIULAI_MARKET_QA: '1',
    NIULAI_MARKET_QA_SUITE: suite,
    ...(Number.isFinite(holdArg) && holdArg >= 0 ? { NIULAI_MARKET_QA_HOLD_MS: String(holdArg) } : {})
  },
  stdio: 'inherit'
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
