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
    enableCustomReminders: false,
    customReminders: [],
  },

  /**
   * 加载配置
   * @returns {Object} 配置对象
   */
  loadConfig() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const savedConfig = JSON.parse(saved);
        const config = { ...this.defaultConfig, ...savedConfig };
        
        // 如果保存的配置中有customReminders且不为空，使用保存的配置
        // 否则使用默认配置
        if (savedConfig.customReminders && Array.isArray(savedConfig.customReminders) && savedConfig.customReminders.length > 0) {
          config.customReminders = savedConfig.customReminders;
        } else {
          config.customReminders = [...this.defaultConfig.customReminders];
        }
        
        return config;
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

    // 应用自定义提醒设置
    const enableCustomReminders = document.getElementById("enableCustomReminders");
    if (enableCustomReminders) {
      enableCustomReminders.checked = config.enableCustomReminders || false;
      
      const customRemindersSection = document.getElementById("customRemindersSection");
      if (customRemindersSection) {
        customRemindersSection.style.display = config.enableCustomReminders ? "block" : "none";
      }
    }

    // 加载自定义提醒列表
    if (typeof CustomReminderUI !== 'undefined') {
      CustomReminderUI.loadReminders();
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
      enableCustomReminders: document.getElementById("enableCustomReminders")?.checked || false,
      customReminders: this.getCustomRemindersFromUI(),
    };
  },

  /**
   * 从UI获取自定义提醒列表
   * @returns {Array} 自定义提醒数组
   */
  getCustomRemindersFromUI() {
    const reminders = [];
    const reminderElements = document.querySelectorAll('.custom-reminder-item');
    
    reminderElements.forEach(element => {
      const id = element.dataset.reminderId;
      const time = element.querySelector('.reminder-time').value;
      const title = element.querySelector('.reminder-title').value;
      const content = element.querySelector('.reminder-content').value;
      const enabled = element.querySelector('.reminder-enabled').checked;
      const repeat = element.querySelector('.reminder-repeat').checked;
      
      if (time && title) {
        reminders.push({
          id: id || 'reminder_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          time,
          title,
          content,
          enabled,
          repeat,
          notifiedDates: []
        });
      }
    });
    
    return reminders;
  },

  /**
   * 添加自定义提醒
   * @param {Object} reminder - 提醒对象
   */
  addCustomReminder(reminder) {
    const config = this.loadConfig();
    config.customReminders.push(reminder);
    this.saveConfig(config);
  },

  /**
   * 删除自定义提醒
   * @param {string} reminderId - 提醒ID
   */
  removeCustomReminder(reminderId) {
    const config = this.loadConfig();
    config.customReminders = config.customReminders.filter(r => r.id !== reminderId);
    this.saveConfig(config);
  },

  /**
   * 更新自定义提醒
   * @param {string} reminderId - 提醒ID
   * @param {Object} updatedReminder - 更新的提醒对象
   */
  updateCustomReminder(reminderId, updatedReminder) {
    const config = this.loadConfig();
    const index = config.customReminders.findIndex(r => r.id === reminderId);
    if (index !== -1) {
      config.customReminders[index] = { ...config.customReminders[index], ...updatedReminder };
      this.saveConfig(config);
    }
  },

  /**
   * 清除提醒通知状态
   * @param {string} reminderId - 提醒ID
   * @param {string} date - 日期字符串 (YYYY-MM-DD)
   */
  clearReminderNotification(reminderId, date) {
    const config = this.loadConfig();
    const reminder = config.customReminders.find(r => r.id === reminderId);
    if (reminder) {
      reminder.notifiedDates = reminder.notifiedDates || [];
      const index = reminder.notifiedDates.indexOf(date);
      if (index > -1) {
        reminder.notifiedDates.splice(index, 1);
      }
      this.saveConfig(config);
    }
  },

  /**
   * 标记提醒已通知
   * @param {string} reminderId - 提醒ID
   * @param {string} date - 日期字符串 (YYYY-MM-DD)
   */
  markReminderNotified(reminderId, date) {
    const config = this.loadConfig();
    const reminder = config.customReminders.find(r => r.id === reminderId);
    if (reminder) {
      reminder.notifiedDates = reminder.notifiedDates || [];
      if (!reminder.notifiedDates.includes(date)) {
        reminder.notifiedDates.push(date);
      }
      this.saveConfig(config);
    }
  },

  /**
   * 检查提醒是否已通知
   * @param {string} reminderId - 提醒ID
   * @param {string} date - 日期字符串 (YYYY-MM-DD)
   * @returns {boolean} 是否已通知
   */
  isReminderNotified(reminderId, date) {
    const config = this.loadConfig();
    const reminder = config.customReminders.find(r => r.id === reminderId);
    return reminder && reminder.notifiedDates && reminder.notifiedDates.includes(date);
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
