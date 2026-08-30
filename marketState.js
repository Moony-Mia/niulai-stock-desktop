// 牛来看盘 - 市场状态判断模块
// 职责：根据行情涨跌幅输出市场状态
// 不负责 DOM，不负责动画，不负责牛动作

window.marketStateEngine = {

  // 行情分类与阈值集中在市场状态层，未知标的保守按普通个股处理。
  INDEX_SYMBOLS: new Set([
    'sh000001', 'sz399001', 'sh000688', 'sh000300', 'sh000016', 'sh000905',
    'int_nasdaq', 'int_dji', 'int_sp500'
  ]),

  MARKET_PROFILES: {
    index: { strongUp: 2.0, up: 0.5, down: -0.5, strongDown: -3.0 },
    stock: { strongUp: 7.0, up: 2.0, down: -2.0, strongDown: -7.0 }
  },

  getInstrumentType(symbol) {
    const normalized = String(symbol || '').trim().toLowerCase();
    if (this.INDEX_SYMBOLS.has(normalized)) return 'index';
    if (/^(sh000\d{3}|sz399\d{3})$/.test(normalized)) return 'index';
    return 'stock';
  },

  getState(changePct, context = {}) {

    const pct = Number(changePct) || 0;
    const instrumentType = context.instrumentType || this.getInstrumentType(context.symbol);
    const profile = this.MARKET_PROFILES[instrumentType] || this.MARKET_PROFILES.stock;

    if (pct >= profile.strongUp) {
      return {
        state: "strong_up",
        direction: "up",
        changePct: pct,
        instrumentType
      };
    }

    if (pct >= profile.up) {
      return {
        state: "up",
        direction: "up",
        changePct: pct,
        instrumentType
      };
    }

    if (pct <= profile.strongDown) {
      return {
        state: "strong_down",
        direction: "down",
        changePct: pct,
        instrumentType
      };
    }

    if (pct <= profile.down) {
      return {
        state: "down",
        direction: "down",
        changePct: pct,
        instrumentType
      };
    }

    return {
      state: "flat",
      direction: "flat",
      changePct: pct,
      instrumentType
    };
  }

};
