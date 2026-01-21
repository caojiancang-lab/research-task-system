/**
 * 用户数据模型（简化版）
 */

export class User {
  id: number = 0
  name: string = ''
  role: string = '' // 角色：研究员、助理、学生等
  department: string = '' // 部门
  email: string = ''
  phone: string = ''
  avatar: string = '' // 头像路径

  constructor(data?: Partial<User>) {
    if (data) {
      Object.assign(this, data)
    }
  }

  /**
   * 获取显示名称
   */
  getDisplayName(): string {
    if (this.role) {
      return `${this.name} (${this.role})`
    }
    return this.name
  }
}

/**
 * 统计数据模型
 */
export class Statistics {
  totalTasks: number = 0
  completedTasks: number = 0
  inProgressTasks: number = 0
  overdueTasks: number = 0
  notStartedTasks: number = 0
  completionRate: number = 0
  overdueRate: number = 0
  avgCompletionDays: number = 0

  constructor(data?: Partial<Statistics>) {
    if (data) {
      Object.assign(this, data)
    }
  }

  /**
   * 计算完成率
   */
  calculateCompletionRate(): void {
    if (this.totalTasks > 0) {
      this.completionRate = Math.round((this.completedTasks / this.totalTasks) * 100)
    }
  }

  /**
   * 计算逾期率
   */
  calculateOverdueRate(): void {
    if (this.totalTasks > 0) {
      this.overdueRate = Math.round((this.overdueTasks / this.totalTasks) * 100)
    }
  }
}

