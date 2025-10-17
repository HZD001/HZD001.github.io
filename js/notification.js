const NotificationManager = {
  permission: "default",
  lunchNotified: false,
  offWorkNotified: false,
  config: null,
  audioCache: {},

  async init(config) {
    this.config = config;
    if ("Notification" in window) {
      this.permission = window.Notification.permission;
      if (this.permission === "default") {
        this.permission = await window.Notification.requestPermission();
      }
    }
  },

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

    if (this.config?.enableVoice) {
      this.speak(body);
    }

    if (
      this.permission !== "granted" &&
      (method === "all" || method === "notification")
    ) {
      console.log(`[提醒] ${title}: ${body}`);
      alert(`${title}\n${body}`);
    }
  },

  showDesktopNotification(title, body, options = {}) {
    if (this.permission === "granted") {
      const notification = new window.Notification(title, {
        body: body,
        icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='%23667eea'/><text x='50' y='65' font-size='50' text-anchor='middle' fill='white'>⏰</text></svg>",
        badge: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='%23667eea'/></svg>",
        requireInteraction: true,
        silent: false,
        tag: `countdown-${Date.now()}`,
        timestamp: Date.now(),
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      notification.onerror = (e) => {
        console.error("通知显示失败:", e);
      };
    } else {
      console.log("通知权限未授予，当前状态:", this.permission);
    }
  },

  playSound() {
    const soundType = this.config?.soundType || "beep";

    if (soundType === "custom" && this.config?.customSoundUrl) {
      this.playCustomSound(this.config.customSoundUrl);
      return;
    }

    this.playBuiltInSound(soundType);
  },

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

  vibrate() {
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  },

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

  notifyLunch() {
    if (!this.lunchNotified) {
      this.show("午休时间到啦！", "该休息一下了，好好享受午休时光吧~");
      this.lunchNotified = true;
    }
  },

  notifyOffWork() {
    if (!this.offWorkNotified) {
      this.show("下班时间到！", "辛苦了一天，可以下班啦！", {
        requireInteraction: true,
      });
      this.offWorkNotified = true;
    }
  },

  reset() {
    this.lunchNotified = false;
    this.offWorkNotified = false;
  },
};
