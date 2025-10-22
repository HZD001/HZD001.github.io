# 下班倒计时 ⏰

<div align="center">

一个简洁高效的工作时间倒计时工具，帮助你科学管理工作时间、关注健康休息

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-14+-green.svg)](https://nodejs.org/)
[![Pure JavaScript](https://img.shields.io/badge/Language-JavaScript-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

</div>

---

## 🌟 功能特性

### 核心功能
- ⏰ **精准倒计时** - 实时显示剩余工作时间，可视化进度条，清晰直观
- 🍱 **智能午休管理** - 自动识别并扣除午休时间，不计入工作时长
- 🌙 **加班计时** - 下班后自动切换到正向加班计时模式，记录加班时长

### 健康提醒
- 🔔 **多维度提醒方式** - 桌面通知、声音提醒、页面闪烁、震动提醒（移动端）、语音播报
- ⏸️ **定时休息提醒** - 番茄工作法风格，可配置间隔时间提醒休息，保护视力和身体健康
- 🎵 **自定义提示音** - 支持多种内置提示音，也可上传自定义音频文件

### 灵活配置
- ⚙️ **精细化设置** - 支持打卡偏移量、自定义工作时长、午休时间等
- 💾 **状态持久化** - 基于 LocalStorage，刷新页面或关闭浏览器都不会丢失计时状态
- 🛠️ **开发者模式** - 内置测试工具，方便调试各种提醒功能

### 用户体验
- 📱 **响应式设计** - 完美适配桌面端、平板和移动端，随时随地使用
- 🎨 **现代化 UI** - 简洁美观的渐变设计，流畅的动画效果
- 🚀 **轻量高效** - 纯 JavaScript 开发，无框架依赖，加载快速

---

## 🚀 快速开始

### 在线使用

直接访问 GitHub Pages 部署的线上版本即可使用，无需安装任何依赖。

### 本地运行

#### 1. 环境要求

- **Node.js** 14.0 或更高版本
- **Python** 3.x（用于本地开发服务器）

#### 2. 克隆项目

```bash
git clone https://github.com/HZD001/HZD001.github.io.git
cd HZD001.github.io
```

#### 3. 启动开发服务器

```bash
# 使用 npm 脚本启动（推荐）
npm run dev

# 或直接使用 Python 启动
python3 -m http.server 8000
```

#### 4. 访问应用

打开浏览器访问 `http://localhost:8000`

---

## 🏗️ 项目结构

```
HZD001.github.io/
├── src/                     # 📁 源文件目录（开发环境）
│   ├── css/
│   │   └── style.css       # 主样式文件（168行）
│   ├── js/
│   │   ├── utils.js        # 工具函数模块（91行）
│   │   ├── config.js       # 配置管理模块（161行）
│   │   ├── notification.js # 通知管理模块（274行）
│   │   └── timer.js        # 定时器核心模块（809行）
│   └── index.html          # 主页面（未压缩，266行）
│
├── css/                     # 📦 构建后的CSS（压缩混淆）
├── js/                      # 📦 构建后的JS（压缩混淆）
│   ├── config.js
│   ├── notification.js
│   ├── timer.js
│   └── utils.js
├── index.html               # 📦 构建后的主页面（压缩）
│
├── sounds/                  # 🎵 音频资源目录（预留）
├── favicon.svg              # 🎨 网站图标
├── 404.html                 # 📄 自定义404页面
│
├── build.js                 # 🔧 构建脚本（压缩混淆工具）
├── package.json             # 📋 项目配置
├── .gitignore               # 🚫 Git忽略配置
└── README.md                # 📖 项目文档
```

### 代码组织原则

项目采用模块化设计，遵循单一职责原则：

- **Utils 模块** - 提供时间格式化、计算等纯函数工具
- **Config 模块** - 负责配置的持久化、加载和 UI 同步
- **Notification 模块** - 封装所有提醒功能（通知、声音、闪烁等）
- **Timer 模块** - 核心业务逻辑，管理倒计时、午休、休息等

---

## 📋 核心模块详解

### 1. Utils 工具模块 (`src/js/utils.js`)

提供时间处理和计算的通用工具方法：

| 方法 | 说明 | 示例 |
|------|------|------|
| `formatTime(seconds)` | 格式化秒数为 HH:MM:SS | `formatTime(3661)` → `"01:01:01"` |
| `formatTimeHHMM(date)` | 格式化日期为 HH:MM | `formatTimeHHMM(new Date())` → `"14:30"` |
| `parseTimeString(timeStr)` | 解析时间字符串为小时和分钟 | `parseTimeString("14:30")` → `{hours: 14, minutes: 30}` |
| `setTimeToDate(date, hours, minutes)` | 将时间设置到日期对象 | - |
| `getSecondsDiff(date1, date2)` | 计算两个日期的秒数差 | - |
| `isInLunchBreak(...)` | 判断当前是否在午休时间 | - |
| `calculateProgress(current, total)` | 计算进度百分比 | `calculateProgress(4000, 8000)` → `50` |

### 2. Config 配置模块 (`src/js/config.js`)

负责配置的保存、加载和 UI 同步：

**核心方法：**
- `loadConfig()` - 从 LocalStorage 加载配置，合并默认配置
- `saveConfig(config)` - 保存配置到 LocalStorage
- `loadTimerState()` - 加载上次保存的计时器状态
- `saveTimerState(state)` - 保存计时器状态（支持刷新恢复）
- `clearTimerState()` - 清除保存的状态
- `applyConfigToUI()` - 将配置同步到设置界面
- `getConfigFromUI()` - 从设置界面读取配置
- `saveCustomSound(file)` - 保存自定义提示音（Base64编码）

**默认配置：**
```javascript
{
  startWorkTime: "",              // 上班时间（留空则使用点击时的时间）
  clockOffsetType: "fast",        // 偏移类型：fast（快）/slow（慢）
  clockOffsetTime: "00:00",       // 打卡偏移量（HH:MM）
  workHours: 8,                   // 每日工作时长（小时）
  lunchBreak: 90,                 // 午休时长（分钟）
  lunchTime: "12:00",             // 午休开始时间
  enableLunchNotify: true,        // 启用午休提醒
  enableOffWorkNotify: true,      // 启用下班提醒
  notifyMethod: "all",            // 提醒方式
  soundType: "beep",              // 提示音类型
  customSoundUrl: null,           // 自定义提示音URL（Base64）
  enableBreakReminder: false,     // 启用定时休息提醒
  breakInterval: 60,              // 休息提醒间隔（分钟）
  breakDuration: 5,               // 建议休息时长（分钟）
  enableDevMode: false            // 开发者模式
}
```

### 3. Notification 通知模块 (`src/js/notification.js`)

封装所有提醒功能，支持多种提醒方式：

**提醒方式：**
- 🖥️ **桌面通知** - `showDesktopNotification()` 使用浏览器 Notification API
- 🔊 **声音提醒** - `playSound()` 支持多种内置音效和自定义音频
- ⚡ **页面闪烁** - `flashPage()` 视觉提醒，改变页面背景色
- 📳 **震动提醒** - `vibrate()` 移动端震动（需浏览器支持）
- 🗣️ **语音播报** - `speak()` 使用 Web Speech API 语音播报

**内置提示音配置：**
```javascript
{
  beep: { frequency: 800, waveType: 'sine', duration: 200, repeat: 3, delay: 100 },
  bell: { frequency: 523.25, waveType: 'sine', duration: 500, repeat: 2, delay: 300 },
  chime: { frequency: 1046.5, waveType: 'triangle', duration: 300, repeat: 3, delay: 150 },
  ding: { frequency: 1200, waveType: 'sine', duration: 150, repeat: 1, delay: 0 }
}
```

**快捷方法：**
- `notifyLunch()` - 午休提醒
- `notifyOffWork()` - 下班提醒
- `notifyBreak()` - 休息提醒
- `reset()` - 重置提醒状态

### 4. Timer 定时器模块 (`src/js/timer.js`)

核心功能模块，包含完整的倒计时业务逻辑：

**状态管理：**
```javascript
{
  startTime: null,           // 上班开始时间
  endTime: null,             // 预计下班时间
  lunchStartTime: null,      // 午休开始时间
  lunchEndTime: null,        // 午休结束时间
  totalWorkSeconds: 0,       // 总工作秒数
  isRunning: false,          // 是否正在运行
  isOnBreak: false,          // 是否正在休息
  isOvertime: false,         // 是否已进入加班模式
  lastBreakTime: null,       // 上次休息时间
  breakRemainingSeconds: 0   // 休息剩余秒数
}
```

**主要方法：**
- `init()` - 初始化定时器，恢复上次状态
- `start()` - 开始计时
- `pause()` - 暂停计时
- `reset()` - 重置计时器
- `update()` - 更新显示（核心循环方法，每秒执行）
- `startBreak()` - 开始休息
- `skipBreak()` - 跳过休息
- `checkBreakReminder()` - 检查是否需要休息提醒
- `enterOvertimeMode()` - 进入加班模式

**计算逻辑：**
1. 考虑打卡偏移量调整实际上班时间
2. 自动识别并扣除午休时间段
3. 实时计算剩余工作秒数
4. 定时检查休息提醒
5. 下班后切换到加班正向计时

---

## ⚙️ 配置选项说明

### 基础设置

| 配置项 | 类型 | 说明 | 默认值 | 取值范围 |
|--------|------|------|--------|----------|
| 今日上班时间 | Time | 打卡机显示的上班时间，留空则使用点击"开始上班"时的实际时间 | `""` | HH:MM |
| 打卡偏移量 | Select + Time | 处理打卡机与实际时间的偏差<br>- **快**：打卡机时间快于实际，减去偏移量<br>- **慢**：打卡机时间慢于实际，加上偏移量 | 快 00:00 | 快/慢 + HH:MM |
| 每日工作时长 | Number | 每天需要工作的小时数 | 8小时 | 1-12小时<br>步长0.5 |
| 午休时长 | Number | 午休时间（分钟），不计入工作时长 | 90分钟 | 0-180分钟<br>步长15 |
| 午休开始时间 | Time | 午休开始的时间点 | 12:00 | HH:MM |

### 提醒设置

| 配置项 | 类型 | 说明 | 默认值 | 可选项 |
|--------|------|------|--------|--------|
| 启用午休提醒 | Checkbox | 到达午休时间时是否提醒 | ✅ 启用 | - |
| 启用下班提醒 | Checkbox | 到达下班时间时是否提醒 | ✅ 启用 | - |
| 提醒方式 | Select | 提醒通知的方式 | 全部提醒 | 全部提醒（桌面通知+声音+闪烁）<br>仅桌面通知<br>仅声音提示<br>仅页面闪烁<br>震动提醒（移动端） |
| 提示音类型 | Select | 提醒声音的类型 | 默认提示音 | 默认提示音（beep）<br>铃声（bell）<br>钟声（chime）<br>叮咚（ding）<br>自定义音频 |
| 自定义音频文件 | File | 上传自定义提示音（MP3/WAV/OGG） | - | - |

### 休息提醒设置

| 配置项 | 类型 | 说明 | 默认值 | 取值范围 |
|--------|------|------|--------|----------|
| 启用定时休息提醒 | Checkbox | 是否开启定时休息提醒功能 | ❌ 禁用 | - |
| 休息提醒间隔 | Number | 每隔多长时间提醒休息一次（分钟） | 60分钟 | 15-120分钟<br>步长5 |
| 建议休息时长 | Number | 建议每次休息的时长（分钟） | 5分钟 | 1-30分钟<br>步长1 |

### 开发者模式

| 功能 | 说明 |
|------|------|
| 测试午休提醒 | 立即触发一次午休提醒，测试提醒效果 |
| 测试下班提醒 | 立即触发一次下班提醒，测试提醒效果 |
| 测试休息提醒 | 立即触发一次休息提醒，测试休息弹窗 |
| 下班前1分钟 | 将倒计时调整为下班前1分钟，方便测试下班流程 |
| 检查通知权限状态 | 查看浏览器通知权限、震动支持、语音支持等状态 |

---

## 🔔 提醒功能详解

### 午休提醒

**触发条件：**
- 到达设置的午休开始时间（默认 12:00）
- 启用了午休提醒功能
- 计时器正在运行中

**提醒内容：**
- 标题："🍱 午休时间到啦"
- 内容："记得按时吃饭，好好休息哦~"
- 状态显示："午休中..."

**效果：**
- 午休时间段不计入工作时长
- 倒计时暂停，等待午休结束后继续
- 午休结束后自动恢复倒计时

### 下班提醒

**触发条件：**
- 倒计时结束，工作时长达标
- 启用了下班提醒功能

**提醒内容：**
- 标题："🎉 下班时间到啦"
- 内容："今天辛苦了，该休息啦！"
- 状态显示："已下班！继续计时将进入加班模式"

**效果：**
- 倒计时停止
- 自动切换到加班模式（正向计时）
- 显示加班时长

### 定时休息提醒

**触发条件：**
- 启用了定时休息提醒功能
- 距离上次休息已达到设定的间隔时间（默认 60 分钟）
- 不在午休时间段内

**提醒流程：**
1. 弹出休息提醒弹窗
2. 显示建议休息时长倒计时（默认 5 分钟）
3. 用户可选择：
   - **开始休息** - 进入休息模式，暂停工作计时
   - **跳过休息** - 继续工作，重置休息间隔计时
   - **15秒自动跳过** - 无操作时自动跳过

**休息模式：**
- 工作倒计时暂停
- 显示休息倒计时
- 休息时间到后自动恢复工作计时

---

## 🔧 构建与部署

### 构建生产版本

项目使用自定义的 `build.js` 脚本进行构建，无需 Webpack 或 Vite 等构建工具：

```bash
npm run build
```

**构建流程：**

1. **CSS 压缩** - 删除注释、压缩空格
2. **JS 压缩** - 删除注释、压缩空格
3. **JS 混淆** - 变量名混淆（保护关键API名称）
4. **HTML 压缩** - 删除注释、压缩空格

**输出结果：**
- `src/` 目录保持不变（源码）
- 根目录生成压缩后的文件（生产环境）

### 部署到 GitHub Pages

项目已配置 GitHub Pages 自动部署：

1. 提交代码到 `master` 分支
2. GitHub 自动部署根目录的压缩文件
3. 通过 `https://yourusername.github.io` 访问

**注意事项：**
- `.gitignore` 已配置忽略 `src/` 目录
- 只需提交构建后的文件到 Git
- 源码保留在本地开发环境

---

## 🌐 浏览器兼容性

| 浏览器 | 版本要求 | 支持情况 |
|--------|----------|----------|
| Chrome | 60+ | ✅ 完全支持 |
| Firefox | 55+ | ✅ 完全支持 |
| Safari | 11+ | ✅ 完全支持 |
| Edge | 79+ | ✅ 完全支持 |
| iOS Safari | 11+ | ✅ 支持（含震动） |
| Android Chrome | 60+ | ✅ 支持（含震动） |

### API 支持情况

| API | Chrome | Firefox | Safari | Edge | 说明 |
|-----|--------|---------|--------|------|------|
| Notification API | ✅ | ✅ | ✅ | ✅ | 桌面通知 |
| Web Audio API | ✅ | ✅ | ✅ | ✅ | 内置提示音 |
| Vibration API | ✅ | ✅ | ❌ | ✅ | 震动提醒（移动端） |
| Web Speech API | ✅ | ❌ | ✅ | ✅ | 语音播报 |
| LocalStorage | ✅ | ✅ | ✅ | ✅ | 状态持久化 |

---

## 📱 移动端支持

### 响应式适配

- 自适应布局，完美适配不同屏幕尺寸
- 触摸友好的按钮和交互设计
- 移动端优化的字体和间距

### 移动端特性

- ✅ 震动提醒（需浏览器支持 Vibration API）
- ✅ 全屏显示，避免地址栏遮挡
- ✅ 添加到主屏幕（PWA-ready，可扩展）
- ✅ 离线状态恢复

### 使用建议

**iOS：**
- 使用 Safari 浏览器访问
- 添加到主屏幕以获得更好的体验
- 允许通知权限以接收提醒

**Android：**
- 推荐使用 Chrome 浏览器
- 允许通知和震动权限
- 可安装为 PWA 应用（未来版本）

---

## 🛠️ 开发指南

### 代码规范

项目遵循以下编码规范：

1. **模块化设计** - 每个 JS 文件独立为一个模块
2. **命名规范** - 采用驼峰命名法（camelCase）
3. **注释规范** - 使用 JSDoc 风格注释函数和模块
4. **代码行数控制** - 每个文件不超过 200 行（动态语言）
5. **文件组织** - 单一职责原则，避免文件过大

### 开发流程

1. **修改源码** - 在 `src/` 目录下修改代码
2. **本地测试** - 使用 `npm run dev` 启动开发服务器
3. **构建生产版本** - 运行 `npm run build` 构建压缩文件
4. **提交代码** - 只提交构建后的文件（根目录）

### 添加新功能

**示例：添加新的提示音**

1. 在 `src/js/notification.js` 的 `getSoundConfig()` 方法中添加新的音效配置
2. 在 `src/index.html` 的 `#soundType` 下拉框中添加新选项
3. 测试新提示音效果
4. 运行 `npm run build` 构建

### 调试技巧

**启用开发者模式：**
1. 打开设置
2. 勾选"启用开发者模式"
3. 使用测试按钮测试各种功能

**常用调试方法：**
- `console.log()` 输出调试信息
- 浏览器开发者工具 → Application → Local Storage 查看存储数据
- Network 标签查看资源加载情况

---

## 📝 常见问题 (FAQ)

### 使用问题

**Q: 为什么没有收到桌面通知？**
- A: 请检查以下几点：
  1. 浏览器是否支持 Notification API
  2. 是否授权了通知权限（首次使用会弹窗请求）
  3. 操作系统的通知设置是否开启
  4. 使用开发者模式的"检查通知权限状态"功能排查

**Q: 刷新页面后倒计时会重置吗？**
- A: 不会。项目使用 LocalStorage 保存计时器状态，刷新页面或关闭浏览器后再打开，倒计时会自动恢复。

**Q: 打卡偏移量怎么设置？**
- A: 
  - 如果打卡机时间**快于**实际时间（例如快 5 分钟），选择"快"，输入 `00:05`
  - 如果打卡机时间**慢于**实际时间（例如慢 3 分钟），选择"慢"，输入 `00:03`

**Q: 午休时间会计入工作时长吗？**
- A: 不会。午休时间段会被自动扣除，不计入工作时长。例如设置 8 小时工作、90 分钟午休，实际需要在公司 9.5 小时。

**Q: 可以自定义提示音吗？**
- A: 可以。在设置中选择"自定义音频"，然后上传 MP3、WAV 或 OGG 格式的音频文件。音频会以 Base64 格式保存到 LocalStorage。

**Q: 移动端可以使用吗？**
- A: 完全可以。项目采用响应式设计，完美适配手机和平板。移动端还支持震动提醒功能。

### 技术问题

**Q: 为什么选择纯 JavaScript 而不是 Vue/React？**
- A: 为了保持项目轻量、加载快速，无需引入框架依赖。纯 JS 也更容易维护和部署。

**Q: 构建脚本做了什么？**
- A: `build.js` 会对 CSS、JS、HTML 进行压缩和混淆，减小文件体积，同时保护代码。

**Q: LocalStorage 有大小限制吗？**
- A: 一般为 5-10MB。本项目存储的配置和状态数据非常小（几 KB），不会有问题。自定义音频会占用较多空间，建议文件小于 1MB。

**Q: 可以部署到其他平台吗？**
- A: 可以。项目是纯静态网站，可以部署到任何支持静态托管的平台，如 Vercel、Netlify、阿里云 OSS、腾讯云 COS 等。

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 提交 Issue

如果发现 Bug 或有功能建议，请：

1. 搜索已有 Issue，避免重复
2. 使用清晰的标题描述问题
3. 提供详细的复现步骤（Bug）或使用场景（功能建议）
4. 附上浏览器版本、操作系统等环境信息

### 提交 Pull Request

1. Fork 本仓库
2. 创建新分支 (`git checkout -b feature/your-feature`)
3. 在 `src/` 目录下修改源码
4. 测试功能是否正常
5. 运行 `npm run build` 构建生产版本
6. 提交代码 (`git commit -m 'feat: add some feature'`)
7. 推送到分支 (`git push origin feature/your-feature`)
8. 创建 Pull Request

**提交信息规范：**
- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 重构
- `perf:` 性能优化
- `test:` 测试相关

---

## 📄 许可证

本项目基于 [MIT License](https://opensource.org/licenses/MIT) 开源。

```
MIT License

Copyright (c) 2024 HZD001

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 致谢

感谢所有为这个项目提供建议和反馈的朋友们！

---

## 📞 联系方式

如有任何问题或建议，欢迎通过以下方式联系：

- GitHub Issues: [HZD001/HZD001.github.io/issues](https://github.com/HZD001/HZD001.github.io/issues)
- GitHub Profile: [@HZD001](https://github.com/HZD001)

---

<div align="center">

**[⬆ 回到顶部](#下班倒计时-)**

Made with ❤️ by HZD001

</div>
