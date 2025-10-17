const Timer = {
  config: null,
  startTime: null,
  endTime: null,
  lunchStartTime: null,
  lunchEndTime: null,
  totalWorkSeconds: 0,
  interval: null,
  isRunning: false,

  elements: {
    timerDisplay: null,
    status: null,
    progressFill: null,
    startBtn: null,
    resetBtn: null,
    startTimeDisplay: null,
    endTimeDisplay: null,
    settingsBtn: null,
    settingsModal: null,
    closeBtn: null,
    cancelBtn: null,
    saveBtn: null,
  },

  init() {
    this.config = Config.loadConfig();
    this.cacheElements();
    this.bindEvents();
    this.loadSavedState();
    Config.applyConfigToUI(this.config);
    NotificationManager.init(this.config);
  },

  cacheElements() {
    this.elements.timerDisplay = document.querySelector(".timer-display .time");
    this.elements.status = document.getElementById("status");
    this.elements.progressFill = document.getElementById("progressFill");
    this.elements.startBtn = document.getElementById("startBtn");
    this.elements.resetBtn = document.getElementById("resetBtn");
    this.elements.startTimeDisplay = document.getElementById("startTime");
    this.elements.endTimeDisplay = document.getElementById("endTime");
    this.elements.settingsBtn = document.getElementById("settingsBtn");
    this.elements.settingsModal = document.getElementById("settingsModal");
    this.elements.closeBtn = document.getElementById("closeBtn");
    this.elements.cancelBtn = document.getElementById("cancelBtn");
    this.elements.saveBtn = document.getElementById("saveBtn");
  },

  bindEvents() {
    this.elements.startBtn.addEventListener("click", () => this.toggleTimer());
    this.elements.resetBtn.addEventListener("click", () => this.reset());
    this.elements.settingsBtn.addEventListener("click", () =>
      this.openSettings()
    );
    this.elements.closeBtn.addEventListener("click", () =>
      this.closeSettings()
    );
    this.elements.cancelBtn.addEventListener("click", () =>
      this.closeSettings()
    );
    this.elements.saveBtn.addEventListener("click", () => this.saveSettings());
    document
      .getElementById("testLunchBtn")
      .addEventListener("click", () => this.testLunchNotification());
    document
      .getElementById("testOffWorkBtn")
      .addEventListener("click", () => this.testOffWorkNotification());
    document
      .getElementById("checkPermissionBtn")
      .addEventListener("click", () => this.checkNotificationPermission());
    
    document
      .getElementById("soundType")
      .addEventListener("change", (e) => this.handleSoundTypeChange(e));
    
    document
      .getElementById("customSound")
      .addEventListener("change", (e) => this.handleCustomSoundUpload(e));
  },

  loadSavedState() {
    const savedState = Config.loadTimerState();
    if (savedState) {
      this.startTime = new Date(savedState.startTime);
      this.endTime = new Date(savedState.endTime);
      this.lunchStartTime = new Date(savedState.lunchStartTime);
      this.lunchEndTime = new Date(savedState.lunchEndTime);
      this.totalWorkSeconds = savedState.totalWorkSeconds;

      this.elements.startTimeDisplay.textContent =
        Utils.formatTimeHHMM(this.startTime);
      this.elements.endTimeDisplay.textContent =
        Utils.formatTimeHHMM(this.endTime);

      const now = new Date();
      if (now < this.endTime) {
        this.start(true);
      } else {
        Config.clearTimerState();
      }
    }
  },

  toggleTimer() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  },

  start(isResuming = false) {
    if (!isResuming) {
      this.calculateTimes();
      this.saveState();
    }

    this.isRunning = true;
    this.elements.startBtn.textContent = "暂停";
    this.elements.resetBtn.disabled = false;
    this.updateDisplay();

    this.interval = setInterval(() => this.tick(), 1000);
  },

  pause() {
    this.isRunning = false;
    this.elements.startBtn.textContent = "继续";
    clearInterval(this.interval);
  },

  reset() {
    this.isRunning = false;
    clearInterval(this.interval);

    this.startTime = null;
    this.endTime = null;
    this.lunchStartTime = null;
    this.lunchEndTime = null;
    this.totalWorkSeconds = 0;

    this.config.startWorkTime = "";
    Config.saveConfig(this.config);
    document.getElementById("startWorkTime").value = "";

    Config.clearTimerState();
    NotificationManager.reset();

    this.elements.startBtn.textContent = "开始上班";
    this.elements.resetBtn.disabled = true;
    this.elements.timerDisplay.textContent = "00:00:00";
    this.elements.status.textContent = "点击开始按钮上班打卡";
    this.elements.progressFill.style.width = "0%";
    this.elements.startTimeDisplay.textContent = "--:--";
    this.elements.endTimeDisplay.textContent = "--:--";
  },

  calculateTimes() {
    const now = new Date();
    const startWorkTimeConfig = this.config.startWorkTime;
    
    if (startWorkTimeConfig && startWorkTimeConfig.trim() !== "") {
      const parsedTime = Utils.parseTimeString(startWorkTimeConfig);
      this.startTime = Utils.setTimeToDate(
        now,
        parsedTime.hours,
        parsedTime.minutes
      );
    } else {
      this.startTime = new Date(now);
    }

    const lunchTimeConfig = Utils.parseTimeString(this.config.lunchTime);
    this.lunchStartTime = Utils.setTimeToDate(
      this.startTime,
      lunchTimeConfig.hours,
      lunchTimeConfig.minutes
    );

    if (this.lunchStartTime <= this.startTime) {
      this.lunchStartTime.setDate(this.lunchStartTime.getDate() + 1);
    }

    this.lunchEndTime = new Date(
      this.lunchStartTime.getTime() + this.config.lunchBreak * 60000
    );

    this.totalWorkSeconds = this.config.workHours * 3600;

    this.endTime = new Date(
      this.startTime.getTime() + this.totalWorkSeconds * 1000
    );

    this.elements.startTimeDisplay.textContent =
      Utils.formatTimeHHMM(this.startTime);
    this.elements.endTimeDisplay.textContent =
      Utils.formatTimeHHMM(this.endTime);
  },

  tick() {
    this.updateDisplay();
    this.checkNotificationManagers();
  },

  updateDisplay() {
    const now = new Date();

    const remainingSeconds = Utils.getSecondsDiff(this.endTime, now);

    if (remainingSeconds <= 0) {
      this.complete();
      return;
    }

    this.elements.timerDisplay.textContent = Utils.formatTime(remainingSeconds);

    const isInLunch = Utils.isInLunchBreak(
      now,
      this.lunchStartTime,
      this.config.lunchBreak
    );

    if (isInLunch) {
      this.elements.status.textContent = "午休时间，好好休息~";
    } else {
      this.elements.status.textContent = "正在努力工作中...";
    }

    const elapsedSeconds = Utils.getSecondsDiff(now, this.startTime);
    const progress = Utils.calculateProgress(
      elapsedSeconds,
      this.totalWorkSeconds
    );
    this.elements.progressFill.style.width = `${progress}%`;
  },

  checkNotificationManagers() {
    const now = new Date();

    if (
      this.config.enableLunchNotify &&
      now >= this.lunchStartTime &&
      now < this.lunchEndTime
    ) {
      NotificationManager.notifyLunch();
    }

    if (this.config.enableOffWorkNotify && now >= this.endTime) {
      NotificationManager.notifyOffWork();
    }
  },

  complete() {
    this.elements.timerDisplay.textContent = "00:00:00";
    this.elements.status.textContent = "下班啦！辛苦了！";
    this.elements.progressFill.style.width = "100%";
    this.pause();
    
    this.startTime = null;
    this.endTime = null;
    this.lunchStartTime = null;
    this.lunchEndTime = null;
    this.totalWorkSeconds = 0;
    
    Config.clearTimerState();
    NotificationManager.reset();
    
    this.elements.startBtn.textContent = "开始上班";
    this.elements.startBtn.disabled = false;

    if (this.config.enableOffWorkNotify) {
      NotificationManager.notifyOffWork();
    }
  },

  saveState() {
    const state = {
      startTime: this.startTime.toISOString(),
      endTime: this.endTime.toISOString(),
      lunchStartTime: this.lunchStartTime.toISOString(),
      lunchEndTime: this.lunchEndTime.toISOString(),
      totalWorkSeconds: this.totalWorkSeconds,
    };
    Config.saveTimerState(state);
  },

  openSettings() {
    this.elements.settingsModal.classList.add("active");
  },

  closeSettings() {
    this.elements.settingsModal.classList.remove("active");
    Config.applyConfigToUI(this.config);
  },

  saveSettings() {
    const newConfig = Config.getConfigFromUI();
    const startWorkTimeChanged = this.config.startWorkTime !== newConfig.startWorkTime;
    
    this.config = newConfig;
    Config.saveConfig(this.config);
    NotificationManager.config = this.config;
    this.closeSettings();

    if (this.isRunning && startWorkTimeChanged) {
      const confirmRecalculate = confirm(
        "上班时间已修改，是否重新计算倒计时？\n\n点击“确定”将根据新设置重新计算开始时间和结束时间"
      );
      
      if (confirmRecalculate) {
        this.recalculateTimes();
      }
    } else if (this.isRunning) {
      alert("设置已保存，将在下次开始计时时生效");
    }
  },

  recalculateTimes() {
    this.calculateTimes();
    this.saveState();
    this.updateDisplay();
  },

  testLunchNotification() {
    NotificationManager.reset();
    NotificationManager.notifyLunch();
  },

  testOffWorkNotification() {
    NotificationManager.reset();
    NotificationManager.notifyOffWork();
  },

  async checkNotificationPermission() {
    const statusDiv = document.getElementById("permissionStatus");
    const permission = window.Notification?.permission || "不支持";

    let html = `<strong>通知权限状态：${permission}</strong><br><br>`;

    if (permission === "granted") {
      html += `
        ✅ 已授权通知权限<br>
        通知将显示在系统通知中心
      `;
    } else if (permission === "denied") {
      html += `
        ❌ 通知权限已被拒绝<br><br>
        <strong>如何重新启用：</strong><br><br>
        
        <strong>Chrome/Edge:</strong><br>
        1. 点击地址栏左侧的 🔒 图标<br>
        2. 找到"通知"设置<br>
        3. 选择"允许"<br>
        4. 刷新页面<br><br>
        
        <strong>Firefox:</strong><br>
        1. 点击地址栏左侧的 🔒 图标<br>
        2. 点击"权限"<br>
        3. 找到"通知"并选择"允许"<br>
        4. 刷新页面<br><br>
        
        <strong>Safari:</strong><br>
        1. Safari菜单 → 偏好设置 → 网站<br>
        2. 点击"通知"<br>
        3. 找到本网站并选择"允许"<br>
        4. 刷新页面
      `;
    } else if (permission === "default") {
      html += `
        ⚠️ 尚未授权通知权限<br><br>
        点击下方按钮请求权限：
      `;
      statusDiv.innerHTML = html;
      statusDiv.style.display = "block";

      const requestBtn = document.createElement("button");
      requestBtn.textContent = "请求通知权限";
      requestBtn.className = "btn btn-primary";
      requestBtn.style.marginTop = "10px";
      requestBtn.onclick = async () => {
        const result = await window.Notification.requestPermission();
        this.checkNotificationPermission();
      };
      statusDiv.appendChild(requestBtn);
      return;
    } else {
      html += `
        ❌ 当前浏览器不支持通知功能<br><br>
        建议使用以下浏览器：<br>
        • Chrome 浏览器<br>
        • Firefox 浏览器<br>
        • Edge 浏览器<br>
        • Safari 浏览器
      `;
    }

    statusDiv.innerHTML = html;
    statusDiv.style.display = "block";
  },

  handleSoundTypeChange(e) {
    const customSoundGroup = document.getElementById("customSoundGroup");
    if (e.target.value === "custom") {
      customSoundGroup.style.display = "block";
    } else {
      customSoundGroup.style.display = "none";
    }
  },

  handleCustomSoundUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      alert("请选择音频文件！");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("文件大小不能超过5MB！");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      Config.saveCustomSound(base64Data);
      const preview = document.getElementById("customSoundPreview");
      preview.textContent = `✓ 已选择：${file.name}`;
      preview.style.color = "#667eea";
    };
    reader.onerror = () => {
      alert("文件读取失败，请重试！");
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  },
};

document.addEventListener("DOMContentLoaded", () => {
  Timer.init();
});
