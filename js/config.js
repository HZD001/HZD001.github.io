const Config = {
  STORAGE_KEY: "countdown_config",
  TIMER_STATE_KEY: "countdown_timer_state",

  defaultConfig: {
    startWorkTime: "09:00",
    workHours: 8,
    lunchBreak: 60,
    lunchTime: "12:00",
    enableLunchNotify: true,
    enableOffWorkNotify: true,
    notifyMethod: "all",
    enableVoice: false,
  },

  loadConfig() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        return { ...this.defaultConfig, ...JSON.parse(saved) };
      } catch (e) {
        return { ...this.defaultConfig };
      }
    }
    return { ...this.defaultConfig };
  },

  saveConfig(config) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
  },

  loadTimerState() {
    const saved = localStorage.getItem(this.TIMER_STATE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  saveTimerState(state) {
    localStorage.setItem(this.TIMER_STATE_KEY, JSON.stringify(state));
  },

  clearTimerState() {
    localStorage.removeItem(this.TIMER_STATE_KEY);
  },

  applyConfigToUI(config) {
    document.getElementById("startWorkTime").value = config.startWorkTime;
    document.getElementById("workHours").value = config.workHours;
    document.getElementById("lunchBreak").value = config.lunchBreak;
    document.getElementById("lunchTime").value = config.lunchTime;
    document.getElementById("enableLunchNotify").checked =
      config.enableLunchNotify;
    document.getElementById("enableOffWorkNotify").checked =
      config.enableOffWorkNotify;
    document.getElementById("notifyMethod").value =
      config.notifyMethod || "all";
    document.getElementById("enableVoice").checked =
      config.enableVoice || false;
  },

  getConfigFromUI() {
    return {
      startWorkTime: document.getElementById("startWorkTime").value,
      workHours: parseFloat(document.getElementById("workHours").value),
      lunchBreak: parseInt(document.getElementById("lunchBreak").value),
      lunchTime: document.getElementById("lunchTime").value,
      enableLunchNotify: document.getElementById("enableLunchNotify").checked,
      enableOffWorkNotify:
        document.getElementById("enableOffWorkNotify").checked,
      notifyMethod: document.getElementById("notifyMethod").value,
      enableVoice: document.getElementById("enableVoice").checked,
    };
  },
};
