/**
 * 主页面 - 科研任务分配管理系统
 */

import router from '@ohos.router'
import { Colors } from '../utils/Constants'
import { DatabaseManager } from '../database/DatabaseManager'
import { Task } from '../models/Task'
import { TaskStatus } from '../utils/Constants'
import { DateUtils } from '../utils/DateUtils'

@Entry
@Component
struct Index {
  @State totalTasks: number = 0
  @State inProgressTasks: number = 0
  @State completedTasks: number = 0
  @State overdueTasks: number = 0
  @State recentTasks: Task[] = []
  private dbManager: DatabaseManager | null = null

  async aboutToAppear() {
    // 初始化数据库
    this.dbManager = DatabaseManager.getInstance(getContext(this))
    await this.dbManager.initDatabase()
    await this.loadStatistics()
  }

  /**
   * 加载统计数据
   */
  async loadStatistics() {
    if (!this.dbManager) return

    const allTasks = await this.dbManager.queryAllTasks()
    this.totalTasks = allTasks.length
    this.inProgressTasks = allTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length
    this.completedTasks = allTasks.filter(t => t.status === TaskStatus.COMPLETED).length
    this.overdueTasks = allTasks.filter(t => t.isOverdue()).length
    this.recentTasks = allTasks.slice(0, 5)
  }

  /**
   * 导航到任务列表
   */
  navigateToTaskList(status?: string) {
    router.pushUrl({
      url: 'pages/TaskList',
      params: { status: status }
    })
  }

  /**
   * 导航到创建任务
   */
  navigateToCreateTask() {
    router.pushUrl({
      url: 'pages/TaskCreate'
    })
  }

  /**
   * 导航到统计页面
   */
  navigateToStatistics() {
    router.pushUrl({
      url: 'pages/Statistics'
    })
  }

  /**
   * 导航到任务详情
   */
  navigateToTaskDetail(taskId: number) {
    router.pushUrl({
      url: 'pages/TaskDetail',
      params: { taskId: taskId }
    })
  }

  build() {
    Column() {
      // 顶部渐变背景区域
      Column() {
        // 标题栏
        Row() {
          Text('科研任务管理')
            .fontSize(28)
            .fontWeight(700)
            .fontColor(Colors.TEXT_WHITE)
            .fontFamily('PingFang SC')
          
          Blank()
          
          Button({ type: ButtonType.Circle }) {
            Text('📊')
              .fontSize(24)
          }
          .width(45)
          .height(45)
          .backgroundColor('rgba(255, 255, 255, 0.2)')
          .onClick(() => this.navigateToStatistics())
        }
        .width('100%')
        .padding({ left: 20, right: 20, top: 15, bottom: 15 })

        // 统计卡片区域
        Row() {
          this.StatCard('全部任务', this.totalTasks, '📋', () => this.navigateToTaskList())
          this.StatCard('进行中', this.inProgressTasks, '⚡', () => this.navigateToTaskList(TaskStatus.IN_PROGRESS))
        }
        .width('100%')
        .padding({ left: 20, right: 20, top: 10 })
        .justifyContent(FlexAlign.SpaceBetween)

        Row() {
          this.StatCard('已完成', this.completedTasks, '✅', () => this.navigateToTaskList(TaskStatus.COMPLETED))
          this.StatCard('已逾期', this.overdueTasks, '⚠️', () => this.navigateToTaskList(TaskStatus.OVERDUE))
        }
        .width('100%')
        .padding({ left: 20, right: 20, top: 12, bottom: 20 })
        .justifyContent(FlexAlign.SpaceBetween)
      }
      .width('100%')
      .linearGradient({
        angle: 135,
        colors: [[Colors.BG_GRADIENT_START, 0.0], [Colors.BG_GRADIENT_END, 1.0]]
      })

      // 最近任务列表
      Column() {
        Row() {
          Text('最近任务')
            .fontSize(20)
            .fontWeight(600)
            .fontColor(Colors.TEXT_PRIMARY)
          
          Blank()
          
          Text('查看全部 >')
            .fontSize(14)
            .fontColor(Colors.TEXT_SECONDARY)
            .onClick(() => this.navigateToTaskList())
        }
        .width('100%')
        .padding({ left: 20, right: 20, top: 20, bottom: 15 })

        if (this.recentTasks.length === 0) {
          Column() {
            Text('📝')
              .fontSize(60)
              .margin({ bottom: 15 })
            
            Text('暂无任务')
              .fontSize(16)
              .fontColor(Colors.TEXT_SECONDARY)
            
            Text('点击下方按钮创建第一个任务')
              .fontSize(14)
              .fontColor(Colors.TEXT_LIGHT)
              .margin({ top: 8 })
          }
          .width('100%')
          .height(250)
          .justifyContent(FlexAlign.Center)
        } else {
          List({ space: 12 }) {
            ForEach(this.recentTasks, (task: Task) => {
              ListItem() {
                this.TaskCard(task)
              }
            })
          }
          .width('100%')
          .padding({ left: 20, right: 20 })
          .layoutWeight(1)
        }
      }
      .layoutWeight(1)
      .backgroundColor(Colors.BG_PRIMARY)

      // 底部创建按钮
      Button('创建新任务')
        .width('90%')
        .height(50)
        .fontSize(18)
        .fontWeight(600)
        .backgroundColor(Colors.PRIMARY_START)
        .borderRadius(25)
        .margin({ top: 15, bottom: 20 })
        .onClick(() => this.navigateToCreateTask())
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Colors.BG_PRIMARY)
  }

  /**
   * 统计卡片组件
   */
  @Builder
  StatCard(title: string, count: number, icon: string, onClick: () => void) {
    Column() {
      Text(icon)
        .fontSize(32)
        .margin({ bottom: 8 })
      
      Text(count.toString())
        .fontSize(28)
        .fontWeight(700)
        .fontColor(Colors.TEXT_WHITE)
        .margin({ bottom: 4 })
      
      Text(title)
        .fontSize(13)
        .fontColor('rgba(255, 255, 255, 0.85)')
    }
    .width('48%')
    .height(120)
    .backgroundColor('rgba(255, 255, 255, 0.15)')
    .borderRadius(16)
    .justifyContent(FlexAlign.Center)
    .onClick(onClick)
    .shadow({
      radius: 8,
      color: 'rgba(0, 0, 0, 0.1)',
      offsetX: 0,
      offsetY: 2
    })
  }

  /**
   * 任务卡片组件
   */
  @Builder
  TaskCard(task: Task) {
    Column() {
      Row() {
        Text(task.taskName)
          .fontSize(16)
          .fontWeight(600)
          .fontColor(Colors.TEXT_PRIMARY)
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .layoutWeight(1)
        
        Text(task.status)
          .fontSize(12)
          .fontColor(Colors.TEXT_WHITE)
          .padding({ left: 10, right: 10, top: 4, bottom: 4 })
          .backgroundColor(this.getStatusColor(task.status))
          .borderRadius(10)
      }
      .width('100%')
      .margin({ bottom: 8 })

      Row() {
        Text(`指派人: ${task.assignerName}`)
          .fontSize(13)
          .fontColor(Colors.TEXT_SECONDARY)
        
        Text('→')
          .fontSize(13)
          .fontColor(Colors.TEXT_LIGHT)
          .margin({ left: 6, right: 6 })
        
        Text(`执行人: ${task.assigneeName}`)
          .fontSize(13)
          .fontColor(Colors.TEXT_SECONDARY)
      }
      .width('100%')
      .margin({ bottom: 8 })

      Row() {
        Text('⏰ ' + DateUtils.getRemainingTimeText(task.planFinishTime))
          .fontSize(12)
          .fontColor(task.isOverdue() ? Colors.STATUS_OVERDUE : Colors.TEXT_SECONDARY)
        
        Blank()
        
        Text(task.priority)
          .fontSize(11)
          .fontColor(this.getPriorityColor(task.priority))
          .padding({ left: 8, right: 8, top: 3, bottom: 3 })
          .border({
            width: 1,
            color: this.getPriorityColor(task.priority),
            radius: 8
          })
      }
      .width('100%')
    }
    .width('100%')
    .padding(16)
    .backgroundColor(Colors.BG_CARD)
    .borderRadius(12)
    .shadow({
      radius: 6,
      color: 'rgba(0, 0, 0, 0.08)',
      offsetX: 0,
      offsetY: 2
    })
    .onClick(() => this.navigateToTaskDetail(task.id))
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

