// 牛来看盘 - 时间状态引擎
// 职责：当前时间 -> 市场时间状态
// 不负责 DOM / UI / 动画

window.timeStateEngine = {

  getState(date = new Date()) {

    const day = date.getDay();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const timeValue = hour * 60 + minute;

    // 周末
    if (day === 0 || day === 6) {
      return {
        dayType: "weekend",
        marketTime: "sleep",
        state: "sleep"
      };
    }

    // A股交易时间
    const morningStart = 9 * 60 + 30;
    const morningEnd = 11 * 60 + 30;
    const afternoonStart = 13 * 60;
    const afternoonEnd = 15 * 60;

    if (
      (timeValue >= morningStart && timeValue <= morningEnd) ||
      (timeValue >= afternoonStart && timeValue <= afternoonEnd)
    ) {
      return {
        dayType: "weekday",
        marketTime: "trading",
        state: "normal"
      };
    }

    return {
      dayType: "weekday",
      marketTime: "closed",
      state: "rest"
    };
  }
};
