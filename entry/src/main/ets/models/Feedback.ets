/**
 * 反馈数据模型
 */

import { FeedbackType } from '../utils/Constants'

export class Feedback {
  id: number = 0
  taskId: number = 0
  feedbackContent: string = ''
  feedbackTime: number = 0
  feedbackType: string = FeedbackType.PROGRESS
  feedbackPerson: string = '' // 反馈人
  attachments: string = '' // 附件路径，逗号分隔
  isRead: number = 0 // 是否已读 0-未读 1-已读
  replyContent: string = '' // 回复内容
  replyTime: number = 0 // 回复时间
  replyPerson: string = '' // 回复人

  constructor(data?: Partial<Feedback>) {
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
      taskId: this.taskId,
      feedbackContent: this.feedbackContent,
      feedbackTime: this.feedbackTime,
      feedbackType: this.feedbackType,
      feedbackPerson: this.feedbackPerson,
      attachments: this.attachments,
      isRead: this.isRead,
      replyContent: this.replyContent,
      replyTime: this.replyTime,
      replyPerson: this.replyPerson
    }
  }

  /**
   * 从数据库对象创建
   */
  static fromDbObject(obj: Record<string, any>): Feedback {
    return new Feedback({
      id: obj.id as number,
      taskId: obj.taskId as number,
      feedbackContent: obj.feedbackContent as string,
      feedbackTime: obj.feedbackTime as number,
      feedbackType: obj.feedbackType as string,
      feedbackPerson: obj.feedbackPerson as string,
      attachments: obj.attachments as string,
      isRead: obj.isRead as number,
      replyContent: obj.replyContent as string,
      replyTime: obj.replyTime as number,
      replyPerson: obj.replyPerson as string
    })
  }

  /**
   * 获取附件列表
   */
  getAttachmentList(): string[] {
    if (!this.attachments) {
      return []
    }
    return this.attachments.split(',').filter(item => item.length > 0)
  }

  /**
   * 是否有回复
   */
  hasReply(): boolean {
    return this.replyContent.length > 0
  }
}

