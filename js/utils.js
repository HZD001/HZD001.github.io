/**
 * 工具函数模块
 * 提供时间格式化、计算等通用工具方法
 */
const Utils = {
  /**
   * 格式化秒数为 HH:MM:SS
   * @param {number} seconds - 秒数
   * @returns {string} 格式化后的时间字符串
   */
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  },

  /**
   * 格式化日期为 HH:MM
   * @param {Date} date - 日期对象
   * @returns {string} 格式化后的时间字符串
   */
  formatTimeHHMM(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  },

  /**
   * 解析时间字符串
   * @param {string} timeStr - 时间字符串（HH:MM）
   * @returns {Object} {hours, minutes}
   */
  parseTimeString(timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return { hours, minutes };
  },

  /**
   * 设置日期的时分
   * @param {Date} date - 日期对象
   * @param {number} hours - 小时
   * @param {number} minutes - 分钟
   * @returns {Date} 新的日期对象
   */
  setTimeToDate(date, hours, minutes) {
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  },

  /**
   * 计算进度百分比
   * @param {number} current - 当前值
   * @param {number} total - 总值
   * @returns {number} 进度百分比 (0-100)
   */
  calculateProgress(current, total) {
    if (total === 0) return 0;
    return Math.min(100, Math.max(0, (current / total) * 100));
  },

  /**
   * 计算两个日期的秒数差
   * @param {Date} date1 - 日期1
   * @param {Date} date2 - 日期2
   * @returns {number} 秒数差
   */
  getSecondsDiff(date1, date2) {
    return Math.floor((date1 - date2) / 1000);
  },

  /**
   * 判断是否在午休时间
   * @param {Date} currentTime - 当前时间
   * @param {Date} lunchStart - 午休开始时间
   * @param {number} lunchDuration - 午休时长(分钟)
   * @returns {boolean} 是否在午休时间
   */
  isInLunchBreak(currentTime, lunchStart, lunchDuration) {
    const lunchEnd = new Date(lunchStart.getTime() + lunchDuration * 60000);
    return currentTime >= lunchStart && currentTime < lunchEnd;
  },
};
