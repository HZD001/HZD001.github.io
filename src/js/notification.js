/**
 * 通知管理模块
 * 负责所有提醒功能(桌面通知/声音/页面闪烁/震动/语音播报)
 */
const NotificationManager = {
  permission: "default",
  lunchNotified: false,
  offWorkNotified: false,
  breakNotified: false,
  customReminderNotified: {}, // 存储自定义提醒通知状态 { reminderId: { date: boolean } }
  config: null,
  audioCache: {},

  /**
   * 初始化通知管理器
   * @param {Object} config - 配置对象
   */
  async init(config) {
    this.config = config;
    if ("Notification" in window) {
      this.permission = window.Notification.permission;
      if (this.permission === "default") {
        this.permission = await window.Notification.requestPermission();
      }
    }
  },

  /**
   * 显示通知
   * @param {string} title - 通知标题
   * @param {string} body - 通知内容
   * @param {Object} options - 额外选项
   */
  show(title, body, options = {}) {
    const method = this.config?.notifyMethod || "all";

    if (method === "all" || method === "notification") {
      this.showDesktopNotification(title, body, options);
    }

    if (method === "all" || method === "sound") {
      this.playSound();
    }

    if (method === "all" || method === "flash") {
      this.flashPage();
    }

    if (method === "vibrate") {
      this.vibrate();
    }
  },

  /**
   * 显示桌面通知
   * @param {string} title - 通知标题
   * @param {string} body - 通知内容
   * @param {Object} options - 额外选项
   */
  showDesktopNotification(title, body, options = {}) {
    if (this.permission === "granted") {
      if (window.location.protocol === "file:") {
        return;
      }
      
      const autoCloseDelay = options.autoCloseDelay || 5000;
      const requireInteraction = options.requireInteraction || false;
      
      try {
        const notification = new window.Notification(title, {
          body: body,
          icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23667eea'/%3E%3Ctext x='50' y='65' font-size='50' text-anchor='middle' fill='white'%3E⏰%3C/text%3E%3C/svg%3E",
          badge: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23667eea'/%3E%3C/svg%3E",
          requireInteraction: requireInteraction,
          silent: false,
          tag: `countdown-${Date.now()}`,
          timestamp: Date.now(),
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        notification.onerror = () => {
          // 静默处理错误，避免控制台报错
        };
        
        if (!requireInteraction) {
          setTimeout(() => {
            notification.close();
          }, autoCloseDelay);
        }
      } catch (e) {
        // 静默处理通知创建失败的情况
      }
    }
  },

  /**
   * 播放提示音
   */
  playSound() {
    const soundType = this.config?.soundType || "beep";

    if (soundType === "custom" && this.config?.customSoundUrl) {
      this.playCustomSound(this.config.customSoundUrl);
      return;
    }

    this.playBuiltInSound(soundType);
  },

  /**
   * 播放自定义音频
   * @param {string} base64Data - Base64 编码的音频数据
   */
  playCustomSound(base64Data) {
    try {
      const audio = new Audio(base64Data);
      audio.volume = 0.5;
      audio.play().catch((e) => console.error("播放自定义音频失败:", e));
    } catch (e) {
      console.error("加载自定义音频失败:", e);
      this.playBuiltInSound("beep");
    }
  },

  /**
   * 播放内置提示音
   * @param {string} type - 音频类型
   */
  playBuiltInSound(type) {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const soundConfig = this.getSoundConfig(type);
      oscillator.frequency.value = soundConfig.frequency;
      oscillator.type = soundConfig.waveType;

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + soundConfig.duration
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + soundConfig.duration);

      if (soundConfig.repeat) {
        setTimeout(() => {
          const osc2 = audioContext.createOscillator();
          const gain2 = audioContext.createGain();
          osc2.connect(gain2);
          gain2.connect(audioContext.destination);
          osc2.frequency.value = soundConfig.frequency;
          osc2.type = soundConfig.waveType;
          gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
          gain2.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + soundConfig.duration
          );
          osc2.start(audioContext.currentTime);
          osc2.stop(audioContext.currentTime + soundConfig.duration);
        }, soundConfig.delay || 300);
      }
    } catch (e) {
      console.error("播放声音失败:", e);
    }
  },

  /**
   * 获取声音配置
   * @param {string} type - 音频类型
   * @returns {Object} 声音配置
   */
  getSoundConfig(type) {
    const configs = {
      beep: {
        frequency: 800,
        waveType: "sine",
        duration: 0.5,
        repeat: true,
        delay: 300,
      },
      bell: {
        frequency: 1000,
        waveType: "triangle",
        duration: 0.8,
        repeat: false,
      },
      chime: {
        frequency: 1200,
        waveType: "sine",
        duration: 0.6,
        repeat: true,
        delay: 400,
      },
      ding: {
        frequency: 1500,
        waveType: "square",
        duration: 0.3,
        repeat: true,
        delay: 200,
      },
    };
    return configs[type] || configs.beep;
  },

  /**
   * 页面闪烁提醒
   */
  flashPage() {
    const card = document.querySelector(".card");
    if (card) {
      card.classList.add("flash-notification");
      setTimeout(() => {
        card.classList.remove("flash-notification");
      }, 1500);
    }

    const originalTitle = document.title;
    let count = 0;
    const interval = setInterval(() => {
      document.title = count % 2 === 0 ? "⏰ 提醒！" : originalTitle;
      count++;
      if (count > 10) {
        clearInterval(interval);
        document.title = originalTitle;
      }
    }, 500);
  },

  /**
   * 震动提醒(移动端)
   */
  vibrate() {
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  },

  /**
   * 语音播报
   * @param {string} text - 要播报的文本
   */
  speak(text) {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  },

  /**
   * 午休提醒
   */
  notifyLunch() {
    if (!this.lunchNotified) {
      this.show("午休时间到啦！", "该休息一下了，好好享受午休时光吧~", {
        requireInteraction: true,
      });
      this.lunchNotified = true;
    }
  },

  /**
   * 下班提醒
   */
  notifyOffWork() {
    if (!this.offWorkNotified) {
      this.show("下班时间到！", "辛苦了一天，可以下班啦！", {
        requireInteraction: true,
      });
      this.offWorkNotified = true;
    }
  },

  /**
   * 定时休息提醒
   */
  notifyBreak() {
    if (!this.breakNotified) {
      this.show("该休息一下啦！", "已经工作一段时间了，起来走走、看看远方，放松一下眼睛和身体吧~", {
        autoCloseDelay: 15000,
      });
      this.breakNotified = true;
    }
  },

  /**
   * 自定义提醒
   * @param {Object} reminder - 提醒对象
   */
  notifyCustomReminder(reminder) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const reminderKey = `${reminder.id}_${today}`;
    
    if (!this.customReminderNotified[reminderKey]) {
      this.show(reminder.title, reminder.content || "定时提醒~", {
        autoCloseDelay: 10000,
      });
      
      // 标记今日已通知
      this.customReminderNotified[reminderKey] = true;
      
      // 更新配置中的通知状态
      Config.markReminderNotified(reminder.id, today);
    }
  },

  /**
   * 检查是否需要通知自定义提醒
   * @param {Array} reminders - 提醒列表
   */
  checkCustomReminders(reminders) {
    if (!reminders || !Array.isArray(reminders)) return;
    
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const today = now.toISOString().split('T')[0];
    
    reminders.forEach(reminder => {
      if (!reminder.enabled) return;
      
      // 检查是否到了提醒时间
      if (reminder.time === currentTime) {
        // 检查今天是否已经通知过
        if (!Config.isReminderNotified(reminder.id, today)) {
          this.notifyCustomReminder(reminder);
        }
      }
    });
  },

  /**
   * 重置提醒状态
   */
  reset() {
    this.lunchNotified = false;
    this.offWorkNotified = false;
    this.breakNotified = false;
    this.customReminderNotified = {};
  },

  /**
   * 重置自定义提醒状态（用于新的一天）
   */
  resetCustomReminders() {
    this.customReminderNotified = {};
  },
};
