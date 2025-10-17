const Utils = {
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  },

  formatTimeHHMM(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  },

  parseTimeString(timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return { hours, minutes };
  },

  setTimeToDate(date, hours, minutes) {
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  },

  calculateProgress(current, total) {
    if (total === 0) return 0;
    return Math.min(100, Math.max(0, (current / total) * 100));
  },

  getSecondsDiff(date1, date2) {
    return Math.floor((date1 - date2) / 1000);
  },

  isInLunchBreak(currentTime, lunchStart, lunchDuration) {
    const lunchEnd = new Date(lunchStart.getTime() + lunchDuration * 60000);
    return currentTime >= lunchStart && currentTime < lunchEnd;
  },
};
