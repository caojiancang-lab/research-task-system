/**
 * 日期工具类
 */

export class DateUtils {
  /**
   * 格式化日期
   */
  static formatDate(timestamp: number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
  }

  /**
   * 获取当前时间戳
   */
  static now(): number {
    return Date.now()
  }

  /**
   * 计算剩余天数
   */
  static getDaysRemaining(targetTimestamp: number): number {
    const now = Date.now()
    const diff = targetTimestamp - now
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  /**
   * 判断是否逾期
   */
  static isOverdue(targetTimestamp: number): boolean {
    return Date.now() > targetTimestamp
  }

  /**
   * 获取友好的时间描述
   */
  static getFriendlyTime(timestamp: number): string {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}天前`
    } else if (hours > 0) {
      return `${hours}小时前`
    } else if (minutes > 0) {
      return `${minutes}分钟前`
    } else {
      return '刚刚'
    }
  }

  /**
   * 获取剩余时间描述
   */
  static getRemainingTimeText(targetTimestamp: number): string {
    const days = this.getDaysRemaining(targetTimestamp)
    
    if (days < 0) {
      return `已逾期${Math.abs(days)}天`
    } else if (days === 0) {
      return '今天截止'
    } else if (days === 1) {
      return '明天截止'
    } else if (days <= 7) {
      return `还剩${days}天`
    } else {
      return this.formatDate(targetTimestamp, 'MM月DD日截止')
    }
  }

  /**
   * 解析日期字符串为时间戳
   */
  static parseDate(dateStr: string): number {
    return new Date(dateStr).getTime()
  }

  /**
   * 获取今天开始时间戳
   */
  static getTodayStart(): number {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today.getTime()
  }

  /**
   * 获取今天结束时间戳
   */
  static getTodayEnd(): number {
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    return today.getTime()
  }
}

