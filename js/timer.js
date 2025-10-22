/**
 * 定时器核心模块
 * 负责管理工作时间倒计时、午休和定时休息功能
 */
const Timer = {
  config: null,
  startTime: null,
  endTime: null,
  lunchStartTime: null,
  lunchEndTime: null,
  totalWorkSeconds: 0,
  interval: null,
  isRunning: false,
  lastBreakTime: null,
  isOnBreak: false,
  breakInterval: null,
  breakRemainingSeconds: 0,
  breakModalTimeout: null,
  breakStartTime: null,
  breakModalShown: false,
  skipBreakCountdown: 15,
  skipBreakInterval: null,
  isOvertime: false,
  overtimeStartTime: null,
  overtimeSeconds: 0,

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
    breakModal: null,
    breakTimer: null,
    skipBreakBtn: null,
    startBreakBtn: null,
  },

  /**
   * 初始化定时器
   */
  init() {
    this.config = Config.loadConfig();
    this.cacheElements();
    this.bindEvents();
    this.loadSavedState();
    Config.applyConfigToUI(this.config);
    NotificationManager.init(this.config);
  },

  /**
   * 缓存 DOM 元素引用
   */
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
    this.elements.breakModal = document.getElementById("breakModal");
    this.elements.breakTimer = document.getElementById("breakTimer");
    this.elements.skipBreakBtn = document.getElementById("skipBreakBtn");
    this.elements.startBreakBtn = document.getElementById("startBreakBtn");
  },

  /**
   * 绑定事件监听
   */
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
      .getElementById("testBreakBtn")
      .addEventListener("click", () => this.testBreakNotification());
    document
      .getElementById("checkPermissionBtn")
      .addEventListener("click", () => this.checkNotificationPermission());
    document
      .getElementById("setBeforeOffWorkBtn")
      .addEventListener("click", () => this.setBeforeOffWork());
    
    document
      .getElementById("enableDevMode")
      .addEventListener("change", (e) => this.handleDevModeChange(e));
    
    document
      .getElementById("soundType")
      .addEventListener("change", (e) => this.handleSoundTypeChange(e));
    
    document
      .getElementById("customSound")
      .addEventListener("change", (e) => this.handleCustomSoundUpload(e));
    
    this.elements.skipBreakBtn.addEventListener("click", () => this.skipBreak());
    this.elements.startBreakBtn.addEventListener("click", () => this.startBreak());
  },

  /**
   * 加载保存的计时状态
   */
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
      
      if (savedState.isOvertime && savedState.overtimeStartTime) {
        this.isOvertime = true;
        this.overtimeStartTime = new Date(savedState.overtimeStartTime);
        this.startOvertime();
      } else if (now < this.endTime) {
        this.start(true);
      } else {
        Config.clearTimerState();
      }
    }
  },

  /**
   * 切换计时器状态(开始/暂停)
   */
  toggleTimer() {
    if (this.isRunning) {
      this.pause();
    } else {
      if (this.elements.startBtn.textContent === "开始加班") {
        this.startOvertime();
      } else {
        this.start();
      }
    }
  },

  /**
   * 开始计时
   * @param {boolean} isResuming - 是否是恢复计时
   */
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

  /**
   * 暂停计时
   */
  pause() {
    this.isRunning = false;
    if (this.isOvertime) {
      this.elements.startBtn.textContent = "继续加班";
    } else {
      this.elements.startBtn.textContent = "继续";
    }
    clearInterval(this.interval);
  },

  /**
   * 重置计时器
   */
  reset() {
    this.isRunning = false;
    clearInterval(this.interval);
    
    if (this.breakInterval) {
      clearInterval(this.breakInterval);
      this.breakInterval = null;
    }
    
    if (this.breakModalTimeout) {
      clearTimeout(this.breakModalTimeout);
      this.breakModalTimeout = null;
    }
    
    if (this.skipBreakInterval) {
      clearInterval(this.skipBreakInterval);
      this.skipBreakInterval = null;
    }
    
    this.isOnBreak = false;
    this.breakModalShown = false;
    this.elements.breakModal.classList.remove("active");
    this.elements.skipBreakBtn.textContent = "跳过休息";

    this.startTime = null;
    this.endTime = null;
    this.lunchStartTime = null;
    this.lunchEndTime = null;
    this.totalWorkSeconds = 0;
    this.lastBreakTime = null;
    this.isOvertime = false;
    this.overtimeStartTime = null;
    this.overtimeSeconds = 0;

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

  /**
   * 计算开始时间、结束时间、午休时间
   */
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
      
      const offsetTime = Utils.parseTimeString(this.config.clockOffsetTime || "00:00");
      const offsetMinutes = offsetTime.hours * 60 + offsetTime.minutes;
      
      if (this.config.clockOffsetType === "slow") {
        this.startTime = new Date(this.startTime.getTime() + offsetMinutes * 60000);
      } else {
        this.startTime = new Date(this.startTime.getTime() - offsetMinutes * 60000);
      }
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
      this.startTime.getTime() + this.totalWorkSeconds * 1000 + this.config.lunchBreak * 60000
    );

    this.elements.startTimeDisplay.textContent =
      Utils.formatTimeHHMM(this.startTime);
    this.elements.endTimeDisplay.textContent =
      Utils.formatTimeHHMM(this.endTime);
  },

  /**
   * 每秒执行的刷新
   */
  tick() {
    if (!this.isOnBreak) {
      if (this.isOvertime) {
        this.updateOvertimeDisplay();
      } else {
        this.updateDisplay();
        this.checkNotificationManagers();
      }
    }
  },

  /**
   * 更新显示界面
   */
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

    if (this.isOnBreak) {
      this.elements.status.textContent = "休息中，放松一下~";
    } else if (isInLunch) {
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

  /**
   * 检查并触发各种提醒(午休/下班/定时休息)
   */
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

    if (this.config.enableBreakReminder && this.isRunning) {
      this.checkBreakReminder(now);
    }
  },

  /**
   * 检查定时休息提醒
   * @param {Date} now - 当前时间
   */
  checkBreakReminder(now) {
    if (!this.lastBreakTime) {
      this.lastBreakTime = new Date();
    }

    if (now >= this.endTime) {
      return;
    }

    const isInLunch = Utils.isInLunchBreak(
      now,
      this.lunchStartTime,
      this.config.lunchBreak
    );

    if (isInLunch) {
      return;
    }

    const minutesSinceLastBreak = Math.floor(
      (now - this.lastBreakTime) / 60000
    );

    if (minutesSinceLastBreak >= this.config.breakInterval && !this.breakModalShown) {
      this.showBreakModal();
    }
  },

  /**
   * 显示休息提醒模态框
   */
  showBreakModal() {
    this.breakRemainingSeconds = this.config.breakDuration * 60;
    this.elements.breakTimer.textContent = Utils.formatTime(this.breakRemainingSeconds);
    this.elements.breakModal.classList.add("active");
    this.breakModalShown = true;
    
    NotificationManager.notifyBreak();
    
    this.skipBreakCountdown = 15;
    this.elements.skipBreakBtn.textContent = `跳过休息 (${this.skipBreakCountdown}s)`;
    
    this.skipBreakInterval = setInterval(() => {
      this.skipBreakCountdown--;
      if (this.skipBreakCountdown > 0) {
        this.elements.skipBreakBtn.textContent = `跳过休息 (${this.skipBreakCountdown}s)`;
      } else {
        this.skipBreak();
      }
    }, 1000);
    
    this.breakModalTimeout = setTimeout(() => {
      this.skipBreak();
    }, 15000);
  },

  /**
   * 跳过休息
   */
  skipBreak() {
    if (this.breakModalTimeout) {
      clearTimeout(this.breakModalTimeout);
      this.breakModalTimeout = null;
    }
    if (this.skipBreakInterval) {
      clearInterval(this.skipBreakInterval);
      this.skipBreakInterval = null;
    }
    if (this.breakInterval) {
      clearInterval(this.breakInterval);
      this.breakInterval = null;
    }
    this.isOnBreak = false;
    this.elements.breakModal.classList.remove("active");
    this.elements.skipBreakBtn.textContent = "跳过休息";
    this.lastBreakTime = new Date();
    this.breakModalShown = false;
    NotificationManager.breakNotified = false;
  },

  /**
   * 开始休息
   */
  startBreak() {
    if (this.breakModalTimeout) {
      clearTimeout(this.breakModalTimeout);
      this.breakModalTimeout = null;
    }
    
    if (this.skipBreakInterval) {
      clearInterval(this.skipBreakInterval);
      this.skipBreakInterval = null;
    }
    
    this.elements.skipBreakBtn.textContent = "跳过休息";
    
    this.isOnBreak = true;
    this.lastBreakTime = new Date();
    this.breakStartTime = new Date();
    
    if (this.breakInterval) {
      clearInterval(this.breakInterval);
    }
    
    this.breakInterval = setInterval(() => {
      this.breakRemainingSeconds--;
      
      if (this.breakRemainingSeconds <= 0) {
        this.endBreak();
      } else {
        this.elements.breakTimer.textContent = Utils.formatTime(this.breakRemainingSeconds);
      }
    }, 1000);
  },

  /**
   * 结束休息
   */
  endBreak() {
    clearInterval(this.breakInterval);
    this.breakInterval = null;
    this.isOnBreak = false;
    this.breakModalShown = false;
    this.elements.breakModal.classList.remove("active");
    
    NotificationManager.breakNotified = false;
  },

  /**
   * 计时完成
   */
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
    this.lastBreakTime = null;
    
    Config.clearTimerState();
    NotificationManager.reset();
    
    this.elements.startBtn.textContent = "开始加班";
    this.elements.startBtn.disabled = false;

    if (this.config.enableOffWorkNotify) {
      NotificationManager.notifyOffWork();
    }
  },

  startOvertime() {
    this.isOvertime = true;
    this.overtimeStartTime = new Date();
    this.overtimeSeconds = 0;
    this.isRunning = true;
    
    this.elements.startBtn.textContent = "暂停";
    this.elements.resetBtn.disabled = false;
    this.elements.status.textContent = "加班中...";
    
    this.interval = setInterval(() => this.tick(), 1000);
  },

  updateOvertimeDisplay() {
    const now = new Date();
    this.overtimeSeconds = Math.floor((now - this.overtimeStartTime) / 1000);
    
    this.elements.timerDisplay.textContent = "+" + Utils.formatTime(this.overtimeSeconds);
    this.elements.status.textContent = "加班中...";
    this.elements.progressFill.style.width = "100%";
  },

  /**
   * 保存计时状态
   */
  saveState() {
    const state = {
      startTime: this.startTime.toISOString(),
      endTime: this.endTime.toISOString(),
      lunchStartTime: this.lunchStartTime.toISOString(),
      lunchEndTime: this.lunchEndTime.toISOString(),
      totalWorkSeconds: this.totalWorkSeconds,
      isOvertime: this.isOvertime,
      overtimeStartTime: this.overtimeStartTime ? this.overtimeStartTime.toISOString() : null,
    };
    Config.saveTimerState(state);
  },

  /**
   * 打开设置模态框
   */
  openSettings() {
    this.elements.settingsModal.classList.add("active");
  },

  /**
   * 关闭设置模态框
   */
  closeSettings() {
    this.elements.settingsModal.classList.remove("active");
    Config.applyConfigToUI(this.config);
  },

  /**
   * 保存设置
   */
  saveSettings() {
    const newConfig = Config.getConfigFromUI();
    const startWorkTimeChanged = this.config.startWorkTime !== newConfig.startWorkTime;
    const workHoursChanged = this.config.workHours !== newConfig.workHours;
    const lunchBreakChanged = this.config.lunchBreak !== newConfig.lunchBreak;
    const lunchTimeChanged = this.config.lunchTime !== newConfig.lunchTime;
    const clockOffsetChanged = 
      this.config.clockOffsetType !== newConfig.clockOffsetType ||
      this.config.clockOffsetTime !== newConfig.clockOffsetTime;
    
    this.config = newConfig;
    Config.saveConfig(this.config);
    NotificationManager.config = this.config;
    this.closeSettings();

    if (this.isRunning && (startWorkTimeChanged || workHoursChanged || lunchBreakChanged || lunchTimeChanged || clockOffsetChanged)) {
      this.recalculateTimes();
    } else if (!this.isRunning && this.config.startWorkTime && this.config.startWorkTime.trim() !== "") {
      this.start();
    }
  },

  /**
   * 重新计算时间
   */
  recalculateTimes() {
    this.calculateTimes();
    this.saveState();
    this.updateDisplay();
  },

  /**
   * 测试午休提醒
   */
  testLunchNotification() {
    NotificationManager.reset();
    NotificationManager.notifyLunch();
  },

  /**
   * 测试下班提醒
   */
  testOffWorkNotification() {
    NotificationManager.reset();
    NotificationManager.notifyOffWork();
  },

  /**
   * 测试休息提醒
   */
  testBreakNotification() {
    NotificationManager.reset();
    this.showBreakModal();
  },

  /**
   * 设置为下班前1分钟（测试用）
   */
  setBeforeOffWork() {
    if (!this.isRunning) {
      alert("请先开始上班计时");
      return;
    }

    const now = new Date();
    
    // 将下班时间设置为1分钟后
    this.endTime = new Date(now.getTime() + 60000);
    
    // 更新显示
    this.elements.endTimeDisplay.textContent = Utils.formatTimeHHMM(this.endTime);
    
    // 保存状态
    this.saveState();
    this.updateDisplay();
    
    alert("已设置为下班前1分钟！\n下班时间：" + Utils.formatTimeHHMM(this.endTime));
  },

  /**
   * 检查通知权限
   */
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

  /**
   * 处理提示音类型变化
   */
  handleSoundTypeChange(e) {
    const customSoundGroup = document.getElementById("customSoundGroup");
    if (e.target.value === "custom") {
      customSoundGroup.style.display = "block";
    } else {
      customSoundGroup.style.display = "none";
    }
  },

  /**
   * 处理自定义音频上传
   */
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

  handleDevModeChange(e) {
    const devModeSection = document.getElementById("devModeSection");
    if (e.target.checked) {
      devModeSection.style.display = "block";
    } else {
      devModeSection.style.display = "none";
    }
  },
};

document.addEventListener("DOMContentLoaded", () => {
  Timer.init();
});
