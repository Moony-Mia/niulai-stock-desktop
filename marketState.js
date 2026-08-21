// 牛来看盘 - 市场状态判断模块
// 职责：根据行情涨跌幅输出市场状态
// 不负责 DOM，不负责动画，不负责牛动作

window.marketStateEngine = {

  getState(changePct) {

    const pct = Number(changePct) || 0;

    if (pct >= 1.5) {
      return {
        state: "strong_up",
        direction: "up",
        changePct: pct
      };
    }

    if (pct >= 0.5) {
      return {
        state: "up",
        direction: "up",
        changePct: pct
      };
    }

    if (pct <= -1.5) {
      return {
        state: "strong_down",
        direction: "down",
        changePct: pct
      };
    }

    if (pct <= -0.5) {
      return {
        state: "down",
        direction: "down",
        changePct: pct
      };
    }

    return {
      state: "flat",
      direction: "flat",
      changePct: pct
    };
  }

};
