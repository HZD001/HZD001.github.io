/**
 * 配置管理模块
 * 负责配置的保存、加载和 UI 同步
 */
const Config = {
  STORAGE_KEY: "countdown_config",
  TIMER_STATE_KEY: "countdown_timer_state",

  defaultConfig: {
    startWorkTime: "",
    clockOffsetType: "fast",
    clockOffsetTime: "00:00",
    workHours: 8,
    lunchBreak: 90,
    lunchTime: "12:00",
    enableLunchNotify: true,
    enableOffWorkNotify: true,
    notifyMethod: "all",
    soundType: "beep",
    customSoundUrl: null,
    enableBreakReminder: false,
    breakInterval: 60,
    breakDuration: 5,
    enableDevMode: false,
  },

  /**
   * 加载配置
   * @returns {Object} 配置对象
   */
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

  /**
   * 保存配置
   * @param {Object} config - 配置对象
   */
  saveConfig(config) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
  },

  /**
   * 加载计时器状态
   * @returns {Object|null} 状态对象
   */
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

  /**
   * 保存计时器状态
   * @param {Object} state - 状态对象
   */
  saveTimerState(state) {
    localStorage.setItem(this.TIMER_STATE_KEY, JSON.stringify(state));
  },

  /**
   * 清除计时器状态
   */
  clearTimerState() {
    localStorage.removeItem(this.TIMER_STATE_KEY);
  },

  /**
   * 将配置应用到 UI
   * @param {Object} config - 配置对象
   */
  applyConfigToUI(config) {
    document.getElementById("startWorkTime").value = config.startWorkTime;
    document.getElementById("clockOffsetType").value = config.clockOffsetType || "fast";
    document.getElementById("clockOffsetTime").value = config.clockOffsetTime || "00:00";
    document.getElementById("workHours").value = config.workHours;
    document.getElementById("lunchBreak").value = config.lunchBreak;
    document.getElementById("lunchTime").value = config.lunchTime;
    document.getElementById("enableLunchNotify").checked =
      config.enableLunchNotify;
    document.getElementById("enableOffWorkNotify").checked =
      config.enableOffWorkNotify;
    document.getElementById("notifyMethod").value =
      config.notifyMethod || "all";
    document.getElementById("soundType").value = config.soundType || "beep";
    document.getElementById("enableBreakReminder").checked =
      config.enableBreakReminder || false;
    document.getElementById("breakInterval").value = config.breakInterval || 60;
    document.getElementById("breakDuration").value = config.breakDuration || 5;
    document.getElementById("enableDevMode").checked =
      config.enableDevMode || false;
    
    const customSoundGroup = document.getElementById("customSoundGroup");
    const customSoundPreview = document.getElementById("customSoundPreview");
    if (config.soundType === "custom") {
      customSoundGroup.style.display = "block";
      if (config.customSoundUrl) {
        customSoundPreview.textContent = "✓ 已选择自定义音频";
      }
    } else {
      customSoundGroup.style.display = "none";
    }
    
    const devModeSection = document.getElementById("devModeSection");
    if (config.enableDevMode) {
      devModeSection.style.display = "block";
    } else {
      devModeSection.style.display = "none";
    }
  },

  /**
   * 从 UI 获取配置
   * @returns {Object} 配置对象
   */
  getConfigFromUI() {
    return {
      startWorkTime: document.getElementById("startWorkTime").value,
      clockOffsetType: document.getElementById("clockOffsetType").value,
      clockOffsetTime: document.getElementById("clockOffsetTime").value,
      workHours: parseFloat(document.getElementById("workHours").value),
      lunchBreak: parseInt(document.getElementById("lunchBreak").value),
      lunchTime: document.getElementById("lunchTime").value,
      enableLunchNotify: document.getElementById("enableLunchNotify").checked,
      enableOffWorkNotify:
        document.getElementById("enableOffWorkNotify").checked,
      notifyMethod: document.getElementById("notifyMethod").value,
      soundType: document.getElementById("soundType").value,
      customSoundUrl: this.loadConfig().customSoundUrl,
      enableBreakReminder: document.getElementById("enableBreakReminder").checked,
      breakInterval: parseInt(document.getElementById("breakInterval").value),
      breakDuration: parseInt(document.getElementById("breakDuration").value),
      enableDevMode: document.getElementById("enableDevMode").checked,
    };
  },

  /**
   * 保存自定义音频
   * @param {string} base64Data - Base64 编码的音频数据
   */
  saveCustomSound(base64Data) {
    const config = this.loadConfig();
    config.customSoundUrl = base64Data;
    this.saveConfig(config);
  },
};
