/**
 * 任务详情页面
 */

import router from '@ohos.router'
import { Colors, TaskStatus } from '../utils/Constants'
import { DatabaseManager } from '../database/DatabaseManager'
import { Task } from '../models/Task'
import { Feedback } from '../models/Feedback'
import { DateUtils } from '../utils/DateUtils'
import promptAction from '@ohos.promptAction'

@Entry
@Component
struct TaskDetail {
  @State task: Task | null = null
  @State feedbacks: Feedback[] = []
  @State showDeleteDialog: boolean = false
  @State showStatusDialog: boolean = false
  private taskId: number = 0
  private dbManager: DatabaseManager | null = null

  async aboutToAppear() {
    // 获取路由参数
    const params = router.getParams() as Record<string, Object>
    if (params && params.taskId) {
      this.taskId = params.taskId as number
    }

    // 初始化数据库
    this.dbManager = DatabaseManager.getInstance(getContext(this))
    await this.loadTaskDetail()
    await this.loadFeedbacks()
  }

  /**
   * 加载任务详情
   */
  async loadTaskDetail() {
    if (!this.dbManager) return

    this.task = await this.dbManager.queryTaskById(this.taskId)
  }

  /**
   * 加载反馈列表
   */
  async loadFeedbacks() {
    if (!this.dbManager) return

    this.feedbacks = await this.dbManager.queryFeedbacksByTaskId(this.taskId)
  }

  /**
   * 更新任务状态
   */
  async updateTaskStatus(newStatus: string) {
    if (!this.task || !this.dbManager) return

    this.task.status = newStatus
    this.task.updateTime = DateUtils.now()
    
    // 如果标记为完成，记录完成时间
    if (newStatus === TaskStatus.COMPLETED) {
      this.task.actualFinishTime = DateUtils.now()
    }

    const success = await this.dbManager.updateTask(this.task)
    
    if (success) {
      promptAction.showToast({ message: '状态更新成功', duration: 2000 })
      await this.loadTaskDetail()
    } else {
      promptAction.showToast({ message: '状态更新失败', duration: 2000 })
    }
    
    this.showStatusDialog = false
  }

  /**
   * 删除任务
   */
  async deleteTask() {
    if (!this.dbManager) return

    const success = await this.dbManager.deleteTask(this.taskId)
    
    if (success) {
      promptAction.showToast({ message: '任务已删除', duration: 2000 })
      setTimeout(() => {
        router.back()
      }, 500)
    } else {
      promptAction.showToast({ message: '删除失败', duration: 2000 })
    }
    
    this.showDeleteDialog = false
  }

  /**
   * 导航到编辑页面
   */
  navigateToEdit() {
    router.pushUrl({
      url: 'pages/TaskEdit',
      params: { taskId: this.taskId }
    })
  }

  /**
   * 导航到反馈页面
   */
  navigateToFeedback() {
    router.pushUrl({
      url: 'pages/FeedbackPage',
      params: { taskId: this.taskId, taskName: this.task?.taskName }
    })
  }

  /**
   * 返回上一页
   */
  goBack() {
    router.back()
  }

  build() {
    Column() {
      // 顶部导航栏
      Row() {
        Button({ type: ButtonType.Circle }) {
          Text('←')
            .fontSize(24)
            .fontColor(Colors.TEXT_WHITE)
        }
        .width(40)
        .height(40)
        .backgroundColor('rgba(255, 255, 255, 0.2)')
        .onClick(() => this.goBack())

        Text('任务详情')
          .fontSize(22)
          .fontWeight(600)
          .fontColor(Colors.TEXT_WHITE)
          .margin({ left: 15 })
        
        Blank()

        Button({ type: ButtonType.Circle }) {
          Text('✏️')
            .fontSize(18)
        }
        .width(40)
        .height(40)
        .backgroundColor('rgba(255, 255, 255, 0.2)')
        .onClick(() => this.navigateToEdit())

        Button({ type: ButtonType.Circle }) {
          Text('🗑️')
            .fontSize(18)
        }
        .width(40)
        .height(40)
        .backgroundColor('rgba(255, 255, 255, 0.2)')
        .margin({ left: 10 })
        .onClick(() => this.showDeleteDialog = true)
      }
      .width('100%')
      .padding({ left: 20, right: 20, top: 15, bottom: 15 })
      .linearGradient({
        angle: 135,
        colors: [[Colors.BG_GRADIENT_START, 0.0], [Colors.BG_GRADIENT_END, 1.0]]
      })

      if (this.task) {
        Scroll() {
          Column() {
            // 任务基本信息卡片
            Column() {
              // 任务名称和状态
              Row() {
                Text(this.task.taskName)
                  .fontSize(20)
                  .fontWeight(700)
                  .fontColor(Colors.TEXT_PRIMARY)
                  .layoutWeight(1)
                  .maxLines(3)
                  .textOverflow({ overflow: TextOverflow.Ellipsis })
                
                Text(this.task.status)
                  .fontSize(13)
                  .fontColor(Colors.TEXT_WHITE)
                  .padding({ left: 12, right: 12, top: 6, bottom: 6 })
                  .backgroundColor(this.getStatusColor(this.task.status))
                  .borderRadius(12)
                  .margin({ left: 10 })
                  .onClick(() => this.showStatusDialog = true)
              }
              .width('100%')
              .margin({ bottom: 15 })

              // 优先级
              Row() {
                Text('优先级')
                  .fontSize(14)
                  .fontColor(Colors.TEXT_SECONDARY)
                
                Blank()
                
                Text(this.task.priority)
                  .fontSize(13)
                  .fontColor(this.getPriorityColor(this.task.priority))
                  .fontWeight(600)
                  .padding({ left: 10, right: 10, top: 4, bottom: 4 })
                  .border({
                    width: 1.5,
                    color: this.getPriorityColor(this.task.priority),
                    radius: 10
                  })
              }
              .width('100%')
              .margin({ bottom: 12 })

              Divider().color(Colors.BG_PRIMARY).margin({ top: 5, bottom: 15 })

              // 人员信息
              this.InfoRow('👤 指派人', this.task.assignerName)
              this.InfoRow('🎯 执行人', this.task.assigneeName)

              Divider().color(Colors.BG_PRIMARY).margin({ top: 15, bottom: 15 })

              // 时间信息
              this.InfoRow('📅 指派时间', DateUtils.formatDate(this.task.assignTime, 'YYYY-MM-DD HH:mm'))
              this.InfoRow('⏰ 计划完成', DateUtils.formatDate(this.task.planFinishTime, 'YYYY-MM-DD'))
              
              if (this.task.actualFinishTime > 0) {
                this.InfoRow('✅ 实际完成', DateUtils.formatDate(this.task.actualFinishTime, 'YYYY-MM-DD HH:mm'))
              } else {
                Row() {
                  Text('⏳ 剩余时间')
                    .fontSize(14)
                    .fontColor(Colors.TEXT_SECONDARY)
                  
                  Blank()
                  
                  Text(DateUtils.getRemainingTimeText(this.task.planFinishTime))
                    .fontSize(14)
                    .fontColor(this.task.isOverdue() ? Colors.STATUS_OVERDUE : Colors.TEXT_PRIMARY)
                    .fontWeight(600)
                }
                .width('100%')
                .margin({ bottom: 12 })
              }

              // 任务描述
              if (this.task.taskDescription) {
                Divider().color(Colors.BG_PRIMARY).margin({ top: 5, bottom: 15 })
                
                Text('任务要求')
                  .fontSize(15)
                  .fontWeight(600)
                  .fontColor(Colors.TEXT_PRIMARY)
                  .width('100%')
                  .margin({ bottom: 10 })
                
                Text(this.task.taskDescription)
                  .fontSize(14)
                  .fontColor(Colors.TEXT_SECONDARY)
                  .lineHeight(22)
                  .width('100%')
              }

              // 标签
              if (this.task.tags) {
                Divider().color(Colors.BG_PRIMARY).margin({ top: 15, bottom: 15 })
                
                Text('标签')
                  .fontSize(15)
                  .fontWeight(600)
                  .fontColor(Colors.TEXT_PRIMARY)
                  .width('100%')
                  .margin({ bottom: 10 })
                
                Row() {
                  ForEach(this.task.tags.split(','), (tag: string) => {
                    if (tag.trim()) {
                      Text(tag.trim())
                        .fontSize(12)
                        .fontColor(Colors.PRIMARY_START)
                        .padding({ left: 10, right: 10, top: 5, bottom: 5 })
                        .backgroundColor('rgba(102, 126, 234, 0.1)')
                        .borderRadius(10)
                        .margin({ right: 8, bottom: 8 })
                    }
                  })
                }
                .width('100%')
              }

              // 备注
              if (this.task.remarks) {
                Divider().color(Colors.BG_PRIMARY).margin({ top: 10, bottom: 15 })
                
                Text('备注')
                  .fontSize(15)
                  .fontWeight(600)
                  .fontColor(Colors.TEXT_PRIMARY)
                  .width('100%')
                  .margin({ bottom: 10 })
                
                Text(this.task.remarks)
                  .fontSize(14)
                  .fontColor(Colors.TEXT_SECONDARY)
                  .lineHeight(22)
                  .width('100%')
              }
            }
            .width('100%')
            .padding(18)
            .backgroundColor(Colors.BG_CARD)
            .borderRadius(16)
            .shadow({
              radius: 10,
              color: 'rgba(0, 0, 0, 0.08)',
              offsetX: 0,
              offsetY: 2
            })
            .margin({ bottom: 20 })

            // 反馈记录
            Row() {
              Text('反馈记录')
                .fontSize(18)
                .fontWeight(600)
                .fontColor(Colors.TEXT_PRIMARY)
              
              Text(`(${this.feedbacks.length})`)
                .fontSize(16)
                .fontColor(Colors.TEXT_SECONDARY)
                .margin({ left: 6 })
              
              Blank()
              
              Button('添加反馈')
                .fontSize(14)
                .fontColor(Colors.TEXT_WHITE)
                .backgroundColor(Colors.PRIMARY_START)
                .height(35)
                .borderRadius(18)
                .onClick(() => this.navigateToFeedback())
            }
            .width('100%')
            .margin({ bottom: 15 })

            // 反馈列表
            if (this.feedbacks.length === 0) {
              Column() {
                Text('💬')
                  .fontSize(50)
                  .margin({ bottom: 10 })
                
                Text('暂无反馈')
                  .fontSize(15)
                  .fontColor(Colors.TEXT_SECONDARY)
                
                Text('点击上方按钮添加反馈')
                  .fontSize(13)
                  .fontColor(Colors.TEXT_LIGHT)
                  .margin({ top: 6 })
              }
              .width('100%')
              .height(180)
              .backgroundColor(Colors.BG_CARD)
              .borderRadius(16)
              .justifyContent(FlexAlign.Center)
            } else {
              Column({ space: 12 }) {
                ForEach(this.feedbacks, (feedback: Feedback) => {
                  this.FeedbackCard(feedback)
                })
              }
              .width('100%')
            }
          }
          .width('100%')
          .padding({ left: 20, right: 20, top: 20, bottom: 20 })
        }
        .layoutWeight(1)
        .backgroundColor(Colors.BG_PRIMARY)
      }

      // 删除确认对话框
      if (this.showDeleteDialog) {
        this.DeleteDialog()
      }

      // 状态修改对话框
      if (this.showStatusDialog) {
        this.StatusDialog()
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Colors.BG_PRIMARY)
  }

  /**
   * 信息行组件
   */
  @Builder
  InfoRow(label: string, value: string) {
    Row() {
      Text(label)
        .fontSize(14)
        .fontColor(Colors.TEXT_SECONDARY)
      
      Blank()
      
      Text(value)
        .fontSize(14)
        .fontColor(Colors.TEXT_PRIMARY)
        .fontWeight(500)
    }
    .width('100%')
    .margin({ bottom: 12 })
  }

  /**
   * 反馈卡片组件
   */
  @Builder
  FeedbackCard(feedback: Feedback) {
    Column() {
      Row() {
        Text(feedback.feedbackPerson)
          .fontSize(15)
          .fontWeight(600)
          .fontColor(Colors.TEXT_PRIMARY)
        
        Text(feedback.feedbackType)
          .fontSize(11)
          .fontColor(Colors.PRIMARY_START)
          .padding({ left: 8, right: 8, top: 3, bottom: 3 })
          .backgroundColor('rgba(102, 126, 234, 0.1)')
          .borderRadius(8)
          .margin({ left: 10 })
        
        Blank()
        
        Text(DateUtils.getFriendlyTime(feedback.feedbackTime))
          .fontSize(12)
          .fontColor(Colors.TEXT_LIGHT)
      }
      .width('100%')
      .margin({ bottom: 10 })

      Text(feedback.feedbackContent)
        .fontSize(14)
        .fontColor(Colors.TEXT_SECONDARY)
        .lineHeight(22)
        .width('100%')

      // 回复内容
      if (feedback.hasReply()) {
        Column() {
          Row() {
            Text('💬 ' + feedback.replyPerson + ' 回复')
              .fontSize(13)
              .fontColor(Colors.TEXT_SECONDARY)
            
            Blank()
            
            Text(DateUtils.getFriendlyTime(feedback.replyTime))
              .fontSize(11)
              .fontColor(Colors.TEXT_LIGHT)
          }
          .width('100%')
          .margin({ bottom: 8 })

          Text(feedback.replyContent)
            .fontSize(13)
            .fontColor(Colors.TEXT_SECONDARY)
            .lineHeight(20)
            .width('100%')
        }
        .width('100%')
        .padding(12)
        .backgroundColor(Colors.BG_PRIMARY)
        .borderRadius(10)
        .margin({ top: 10 })
      }
    }
    .width('100%')
    .padding(15)
    .backgroundColor(Colors.BG_CARD)
    .borderRadius(12)
    .shadow({
      radius: 6,
      color: 'rgba(0, 0, 0, 0.06)',
      offsetX: 0,
      offsetY: 2
    })
  }

  /**
   * 删除确认对话框
   */
  @Builder
  DeleteDialog() {
    Column() {
      Column() {
        Text('确认删除')
          .fontSize(18)
          .fontWeight(600)
          .fontColor(Colors.TEXT_PRIMARY)
          .margin({ bottom: 15 })
        
        Text('删除后将无法恢复，确定要删除这个任务吗？')
          .fontSize(14)
          .fontColor(Colors.TEXT_SECONDARY)
          .lineHeight(22)
          .margin({ bottom: 25 })
        
        Row() {
          Button('取消')
            .fontSize(15)
            .fontColor(Colors.TEXT_SECONDARY)
            .backgroundColor(Colors.BG_PRIMARY)
            .layoutWeight(1)
            .height(45)
            .onClick(() => this.showDeleteDialog = false)
          
          Button('删除')
            .fontSize(15)
            .fontColor(Colors.TEXT_WHITE)
            .backgroundColor(Colors.STATUS_OVERDUE)
            .layoutWeight(1)
            .height(45)
            .margin({ left: 12 })
            .onClick(() => this.deleteTask())
        }
        .width('100%')
      }
      .width('85%')
      .padding(20)
      .backgroundColor(Colors.BG_CARD)
      .borderRadius(16)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('rgba(0, 0, 0, 0.5)')
    .justifyContent(FlexAlign.Center)
    .onClick(() => this.showDeleteDialog = false)
  }

  /**
   * 状态修改对话框
   */
  @Builder
  StatusDialog() {
    Column() {
      Column() {
        Text('修改状态')
          .fontSize(18)
          .fontWeight(600)
          .fontColor(Colors.TEXT_PRIMARY)
          .margin({ bottom: 20 })
        
        this.StatusOption(TaskStatus.NOT_STARTED)
        this.StatusOption(TaskStatus.IN_PROGRESS)
        this.StatusOption(TaskStatus.COMPLETED)
        this.StatusOption(TaskStatus.OVERDUE)
        
        Button('取消')
          .fontSize(15)
          .fontColor(Colors.TEXT_SECONDARY)
          .backgroundColor(Colors.BG_PRIMARY)
          .width('100%')
          .height(45)
          .margin({ top: 15 })
          .onClick(() => this.showStatusDialog = false)
      }
      .width('85%')
      .padding(20)
      .backgroundColor(Colors.BG_CARD)
      .borderRadius(16)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('rgba(0, 0, 0, 0.5)')
    .justifyContent(FlexAlign.Center)
    .onClick(() => this.showStatusDialog = false)
  }

  /**
   * 状态选项
   */
  @Builder
  StatusOption(status: string) {
    Row() {
      Text(status)
        .fontSize(15)
        .fontColor(Colors.TEXT_PRIMARY)
      
      Blank()
      
      if (this.task && this.task.status === status) {
        Text('✓')
          .fontSize(18)
          .fontColor(Colors.PRIMARY_START)
          .fontWeight(700)
      }
    }
    .width('100%')
    .height(50)
    .padding({ left: 15, right: 15 })
    .backgroundColor(this.task && this.task.status === status ? 'rgba(102, 126, 234, 0.1)' : Colors.BG_PRIMARY)
    .borderRadius(10)
    .margin({ bottom: 10 })
    .onClick(() => this.updateTaskStatus(status))
  }

  /**
   * 获取状态颜色
   */
  getStatusColor(status: string): string {
    switch (status) {
      case TaskStatus.NOT_STARTED:
        return Colors.STATUS_NOT_STARTED
      case TaskStatus.IN_PROGRESS:
        return Colors.STATUS_IN_PROGRESS
      case TaskStatus.COMPLETED:
        return Colors.STATUS_COMPLETED
      case TaskStatus.OVERDUE:
        return Colors.STATUS_OVERDUE
      default:
        return Colors.STATUS_NOT_STARTED
    }
  }

  /**
   * 获取优先级颜色
   */
  getPriorityColor(priority: string): string {
    switch (priority) {
      case '低':
        return Colors.PRIORITY_LOW
      case '中':
        return Colors.PRIORITY_MEDIUM
      case '高':
        return Colors.PRIORITY_HIGH
      case '紧急':
        return Colors.PRIORITY_URGENT
      default:
        return Colors.PRIORITY_MEDIUM
    }
  }
}

