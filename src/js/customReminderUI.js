/**
 * 自定义提醒UI管理模块
 * 负责自定义提醒的界面显示和交互
 */
const CustomReminderUI = {
  /**
   * 初始化自定义提醒UI
   */
  init() {
    this.bindEvents();
    this.loadReminders();
  },

  /**
   * 绑定事件���听
   */
  bindEvents() {
    // 启用/禁用自定义提醒
    const enableCustomReminders = document.getElementById('enableCustomReminders');
    if (enableCustomReminders) {
      enableCustomReminders.addEventListener('change', (e) => {
        const section = document.getElementById('customRemindersSection');
        section.style.display = e.target.checked ? 'block' : 'none';
      });
    }

    // 添加新提醒按钮
    const addBtn = document.getElementById('addReminderBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.addNewReminder());
    }

    // 测试自定义提醒按钮
    const testBtn = document.getElementById('testCustomReminderBtn');
    if (testBtn) {
      testBtn.addEventListener('click', () => this.testCustomReminder());
    }

    // 清除提醒状态按钮
    const clearBtn = document.getElementById('clearCustomRemindersBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearReminderStates());
    }
  },

  /**
   * 加载已有提醒
   */
  loadReminders() {
    const config = Config.loadConfig();
    const container = document.getElementById('customRemindersList');
    
    if (container && config.customReminders) {
      container.innerHTML = '';
      config.customReminders.forEach(reminder => {
        this.renderReminder(reminder);
      });
    }
  },

  /**
   * 渲染单个提醒项
   * @param {Object} reminder - 提醒对象
   */
  renderReminder(reminder) {
    const container = document.getElementById('customRemindersList');
    if (!container) return;

    const reminderEl = document.createElement('div');
    reminderEl.className = 'custom-reminder-item';
    reminderEl.dataset.reminderId = reminder.id;

    reminderEl.innerHTML = `
      <div class="custom-reminder-header">
        <div class="custom-reminder-title">
          <span>⏰</span>
          <span>${reminder.title}</span>
        </div>
        <div class="custom-reminder-actions">
          <button type="button" class="custom-reminder-btn delete" onclick="CustomReminderUI.removeReminder('${reminder.id}')">删除</button>
        </div>
      </div>
      <div class="custom-reminder-fields">
        <div class="custom-reminder-field">
          <label>时间</label>
          <input type="time" class="reminder-time" value="${reminder.time}" />
        </div>
        <div class="custom-reminder-field">
          <label>标题</label>
          <input type="text" class="reminder-title" value="${reminder.title}" placeholder="提醒标题" />
        </div>
        <div class="custom-reminder-field full-width">
          <label>内容</label>
          <textarea class="reminder-content" placeholder="提醒内容（可选）">${reminder.content || ''}</textarea>
        </div>
      </div>
      <div class="custom-reminder-checkboxes">
        <label>
          <input type="checkbox" class="reminder-enabled" ${reminder.enabled ? 'checked' : ''} />
          启用此提醒
        </label>
        <label>
          <input type="checkbox" class="reminder-repeat" ${reminder.repeat ? 'checked' : ''} />
          每天重复
        </label>
      </div>
    `;

    container.appendChild(reminderEl);
  },

  /**
   * 添加新提醒
   */
  addNewReminder() {
    const newReminder = {
      id: 'reminder_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      time: '09:00',
      title: '新提醒',
      content: '',
      enabled: true,
      repeat: true,
      notifiedDates: []
    };

    this.renderReminder(newReminder);
  },

  /**
   * 删除提醒
   * @param {string} reminderId - 提醒ID
   */
  removeReminder(reminderId) {
    const reminderEl = document.querySelector(`[data-reminder-id="${reminderId}"]`);
    if (reminderEl) {
      // 先从配置中删除
      Config.removeCustomReminder(reminderId);
      
      // 再从 DOM 中删除
      reminderEl.classList.add('removing');
      setTimeout(() => {
        reminderEl.remove();
      }, 300);
      
      // 更新 Timer 的配置
      if (typeof Timer !== 'undefined' && Timer.config) {
        Timer.config = Config.loadConfig();
      }
    }
  },

  /**
   * 测试自定义提醒
   */
  testCustomReminder() {
    const config = Config.loadConfig();
    const enabledReminders = config.customReminders.filter(r => r.enabled);
    
    if (enabledReminders.length === 0) {
      alert('没有启用的自定义提醒，请先添加并启用提醒。');
      return;
    }

    // 使用第一个启用的提醒进行测试
    const testReminder = enabledReminders[0];
    NotificationManager.notifyCustomReminder(testReminder);
  },

  /**
   * 清除提醒状态
   */
  clearReminderStates() {
    const config = Config.loadConfig();
    
    // 清除所有提醒的通知状态
    config.customReminders.forEach(reminder => {
      reminder.notifiedDates = [];
    });

    Config.saveConfig(config);
    NotificationManager.resetCustomReminders();

    alert('已清除所有提醒的通知状态，今天可以重新接收提醒。');
  },

  /**
   * 更新启用状态显示
   * @param {boolean} enabled - 是否启用
   */
  updateEnableState(enabled) {
    const section = document.getElementById('customRemindersSection');
    const checkbox = document.getElementById('enableCustomReminders');
    
    if (section && checkbox) {
      checkbox.checked = enabled;
      section.style.display = enabled ? 'block' : 'none';
    }
  }
};