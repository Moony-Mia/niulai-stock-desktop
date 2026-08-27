// 牛来看盘 - 牛动作请求映射
// 职责：市场状态 + 时间状态 -> 规范化 action request；不负责 sprite 播放或 DOM。

window.cowStateMachine = {

  getActionRequest(marketState, timeState) {

    // 时间优先：休息和睡眠覆盖行情情绪
    if (timeState && timeState.state === "sleep") {
      return {
        emotion: "sleep",
        action: "sleep", priority: 30, category: "time"
      };
    }

    if (timeState && timeState.state === "rest") {
      return {
        emotion: "rest",
        action: "idle", priority: 30, category: "time"
      };
    }

    if (!marketState || !marketState.state) {
      return {
        emotion: "thinking",
        action: "idle", priority: 0, category: "default"
      };
    }

    switch (marketState.state) {

      case "strong_up":
        return {
          emotion: "excited",
          action: "jumping", priority: 70, category: "market"
        };

      case "up":
        return {
          emotion: "happy",
          // V2 的 happy/tail_wag 素材尚未加入；沿用当前实际展示的 jumping。
          action: "jumping", priority: 60, category: "market"
        };

      case "flat":
        return {
          emotion: "thinking",
          action: "idle", priority: 40, category: "market"
        };

      case "down":
        return {
          emotion: "sad",
          // V2 的 head_down 素材尚未加入；沿用当前实际展示的 failed。
          action: "failed", priority: 60, category: "market"
        };

      case "strong_down":
        return {
          emotion: "panic",
          // V2 的 panic 素材尚未加入；沿用当前实际展示的 failed。
          action: "failed", priority: 70, category: "market"
        };

      default:
        return {
          emotion: "thinking",
        action: "idle", priority: 0, category: "default"
        };
    }
  },

  // 兼容旧调用方；新展示链路使用 getActionRequest。
  getCowState(marketState, timeState) {
    return this.getActionRequest(marketState, timeState);
  }
};
