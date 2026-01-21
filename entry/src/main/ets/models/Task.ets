/**
 * 任务数据模型
 */

import { TaskStatus, TaskPriority } from '../utils/Constants'

export class Task {
  id: number = 0
  taskName: string = ''
  taskDescription: string = ''
  assignerName: string = ''
  assigneeName: string = ''
  assignTime: number = 0
  planFinishTime: number = 0
  actualFinishTime: number = 0
  status: string = TaskStatus.NOT_STARTED
  priority: string = TaskPriority.MEDIUM
  createTime: number = 0
  updateTime: number = 0
  tags: string = '' // 标签，逗号分隔
  remarks: string = '' // 备注

  constructor(data?: Partial<Task>) {
    if (data) {
      Object.assign(this, data)
    }
  }

  /**
   * 转换为数据库存储格式
   */
  toDbObject(): Record<string, any> {
    return {
      id: this.id,
      taskName: this.taskName,
      taskDescription: this.taskDescription,
      assignerName: this.assignerName,
      assigneeName: this.assigneeName,
      assignTime: this.assignTime,
      planFinishTime: this.planFinishTime,
      actualFinishTime: this.actualFinishTime,
      status: this.status,
      priority: this.priority,
      createTime: this.createTime,
      updateTime: this.updateTime,
      tags: this.tags,
      remarks: this.remarks
    }
  }

  /**
   * 从数据库对象创建
   */
  static fromDbObject(obj: Record<string, any>): Task {
    return new Task({
      id: obj.id as number,
      taskName: obj.taskName as string,
      taskDescription: obj.taskDescription as string,
      assignerName: obj.assignerName as string,
      assigneeName: obj.assigneeName as string,
      assignTime: obj.assignTime as number,
      planFinishTime: obj.planFinishTime as number,
      actualFinishTime: obj.actualFinishTime as number,
      status: obj.status as string,
      priority: obj.priority as string,
      createTime: obj.createTime as number,
      updateTime: obj.updateTime as number,
      tags: obj.tags as string,
      remarks: obj.remarks as string
    })
  }

  /**
   * 判断是否逾期
   */
  isOverdue(): boolean {
    if (this.status === TaskStatus.COMPLETED) {
      return false
    }
    return Date.now() > this.planFinishTime
  }

  /**
   * 获取进度百分比（基于反馈数量估算）
   */
  getProgressPercentage(): number {
    switch (this.status) {
      case TaskStatus.NOT_STARTED:
        return 0
      case TaskStatus.IN_PROGRESS:
        return 50
      case TaskStatus.COMPLETED:
        return 100
      case TaskStatus.OVERDUE:
        return 75
      default:
        return 0
    }
  }
}

