// 牛来看盘 - 牛状态机
// 职责：市场状态 -> 牛行为状态

window.cowStateMachine = {

  getCowState(marketState) {

    if (!marketState || !marketState.state) {
      return {
        emotion: "thinking",
        action: "idle"
      };
    }

    switch (marketState.state) {

      case "strong_up":
        return {
          emotion: "excited",
          action: "jump"
        };

      case "up":
        return {
          emotion: "happy",
          action: "tail_wag"
        };

      case "flat":
        return {
          emotion: "thinking",
          action: "idle"
        };

      case "down":
        return {
          emotion: "sad",
          action: "lower_head"
        };

      case "strong_down":
        return {
          emotion: "panic",
          action: "run"
        };

      default:
        return {
          emotion: "thinking",
          action: "idle"
        };
    }
  }
};