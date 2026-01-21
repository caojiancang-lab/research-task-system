/**
 * 任务列表页面
 */

import router from '@ohos.router'
import { Colors, TaskStatus, TaskPriority } from '../utils/Constants'
import { DatabaseManager } from '../database/DatabaseManager'
import { Task } from '../models/Task'
import { DateUtils } from '../utils/DateUtils'

@Entry
@Component
struct TaskList {
  @State tasks: Task[] = []
  @State filteredTasks: Task[] = []
  @State currentFilter: string = '全部'
  @State searchText: string = ''
  private dbManager: DatabaseManager | null = null
  private filterStatus: string = ''

  async aboutToAppear() {
    // 获取路由参数
    const params = router.getParams() as Record<string, Object>
    if (params && params.status) {
      this.filterStatus = params.status as string
      this.currentFilter = this.filterStatus
    }

    // 初始化数据库
    this.dbManager = DatabaseManager.getInstance(getContext(this))
    await this.loadTasks()
  }

  /**
   * 加载任务列表
   */
  async loadTasks() {
    if (!this.dbManager) return

    if (this.filterStatus) {
      this.tasks = await this.dbManager.queryTasksByStatus(this.filterStatus)
    } else {
      this.tasks = await this.dbManager.queryAllTasks()
    }
    
    this.filteredTasks = this.tasks
  }

  /**
   * 筛选任务
   */
  filterTasks(status: string) {
    this.currentFilter = status
    
    if (status === '全部') {
      this.filteredTasks = this.tasks
    } else {
      this.filteredTasks = this.tasks.filter(task => task.status === status)
    }
  }

  /**
   * 搜索任务
   */
  searchTasks(keyword: string) {
    this.searchText = keyword
    
    if (!keyword) {
      this.filteredTasks = this.tasks
      return
    }

    this.filteredTasks = this.tasks.filter(task => 
      task.taskName.includes(keyword) ||
      task.assignerName.includes(keyword) ||
      task.assigneeName.includes(keyword) ||
      task.taskDescription.includes(keyword)
    )
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

  /**
   * 导航到创建任务
   */
  navigateToCreateTask() {
    router.pushUrl({
      url: 'pages/TaskCreate'
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

        Text('任务列表')
          .fontSize(22)
          .fontWeight(600)
          .fontColor(Colors.TEXT_WHITE)
          .margin({ left: 15 })
        
        Blank()

        Button({ type: ButtonType.Circle }) {
          Text('➕')
            .fontSize(20)
            .fontColor(Colors.TEXT_WHITE)
        }
        .width(40)
        .height(40)
        .backgroundColor('rgba(255, 255, 255, 0.2)')
        .onClick(() => this.navigateToCreateTask())
      }
      .width('100%')
      .padding({ left: 20, right: 20, top: 15, bottom: 15 })
      .linearGradient({
        angle: 135,
        colors: [[Colors.BG_GRADIENT_START, 0.0], [Colors.BG_GRADIENT_END, 1.0]]
      })

      // 搜索框
      Row() {
        TextInput({ placeholder: '搜索任务、人员...' })
          .width('100%')
          .height(45)
          .fontSize(15)
          .backgroundColor(Colors.BG_CARD)
          .borderRadius(22)
          .padding({ left: 45, right: 15 })
          .onChange((value: string) => this.searchTasks(value))
        
        Text('🔍')
          .fontSize(20)
          .position({ x: 15, y: 12 })
      }
      .width('100%')
      .padding({ left: 20, right: 20, top: 15, bottom: 10 })
      .backgroundColor(Colors.BG_PRIMARY)

      // 筛选标签
      Row() {
        this.FilterChip('全部', this.currentFilter === '全部')
        this.FilterChip(TaskStatus.NOT_STARTED, this.currentFilter === TaskStatus.NOT_STARTED)
        this.FilterChip(TaskStatus.IN_PROGRESS, this.currentFilter === TaskStatus.IN_PROGRESS)
        this.FilterChip(TaskStatus.COMPLETED, this.currentFilter === TaskStatus.COMPLETED)
        this.FilterChip(TaskStatus.OVERDUE, this.currentFilter === TaskStatus.OVERDUE)
      }
      .width('100%')
      .padding({ left: 20, right: 20, top: 5, bottom: 15 })
      .backgroundColor(Colors.BG_PRIMARY)

      // 任务列表
      if (this.filteredTasks.length === 0) {
        Column() {
          Text('📭')
            .fontSize(60)
            .margin({ bottom: 15 })
          
          Text('暂无任务')
            .fontSize(16)
            .fontColor(Colors.TEXT_SECONDARY)
          
          Text(this.searchText ? '试试其他搜索关键词' : '点击右上角创建新任务')
            .fontSize(14)
            .fontColor(Colors.TEXT_LIGHT)
            .margin({ top: 8 })
        }
        .width('100%')
        .layoutWeight(1)
        .justifyContent(FlexAlign.Center)
        .backgroundColor(Colors.BG_PRIMARY)
      } else {
        List({ space: 12 }) {
          ForEach(this.filteredTasks, (task: Task) => {
            ListItem() {
              this.TaskCard(task)
            }
          })
        }
        .width('100%')
        .padding({ left: 20, right: 20, bottom: 20 })
        .layoutWeight(1)
        .backgroundColor(Colors.BG_PRIMARY)
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Colors.BG_PRIMARY)
  }

  /**
   * 筛选标签组件
   */
  @Builder
  FilterChip(label: string, isActive: boolean) {
    Text(label)
      .fontSize(13)
      .fontColor(isActive ? Colors.TEXT_WHITE : Colors.TEXT_SECONDARY)
      .padding({ left: 14, right: 14, top: 7, bottom: 7 })
      .backgroundColor(isActive ? Colors.PRIMARY_START : Colors.BG_CARD)
      .borderRadius(16)
      .margin({ right: 8 })
      .onClick(() => this.filterTasks(label))
  }

  /**
   * 任务卡片组件
   */
  @Builder
  TaskCard(task: Task) {
    Column() {
      // 任务标题和状态
      Row() {
        Column() {
          Text(task.taskName)
            .fontSize(17)
            .fontWeight(600)
            .fontColor(Colors.TEXT_PRIMARY)
            .maxLines(2)
            .textOverflow({ overflow: TextOverflow.Ellipsis })
        }
        .layoutWeight(1)
        .alignItems(HorizontalAlign.Start)
        
        Text(task.status)
          .fontSize(12)
          .fontColor(Colors.TEXT_WHITE)
          .padding({ left: 10, right: 10, top: 5, bottom: 5 })
          .backgroundColor(this.getStatusColor(task.status))
          .borderRadius(10)
          .margin({ left: 10 })
      }
      .width('100%')
      .margin({ bottom: 12 })

      // 任务描述
      if (task.taskDescription) {
        Text(task.taskDescription)
          .fontSize(14)
          .fontColor(Colors.TEXT_SECONDARY)
          .maxLines(2)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .width('100%')
          .margin({ bottom: 12 })
      }

      // 人员信息
      Row() {
        Row() {
          Text('👤')
            .fontSize(14)
            .margin({ right: 4 })
          
          Text(task.assignerName)
            .fontSize(13)
            .fontColor(Colors.TEXT_SECONDARY)
        }

        Text('→')
          .fontSize(13)
          .fontColor(Colors.TEXT_LIGHT)
          .margin({ left: 8, right: 8 })
        
        Row() {
          Text('🎯')
            .fontSize(14)
            .margin({ right: 4 })
          
          Text(task.assigneeName)
            .fontSize(13)
            .fontColor(Colors.TEXT_SECONDARY)
        }

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
      .margin({ bottom: 10 })

      // 时间信息
      Row() {
        Text('📅 ' + DateUtils.formatDate(task.assignTime, 'MM月DD日'))
          .fontSize(12)
          .fontColor(Colors.TEXT_LIGHT)
        
        Blank()
        
        Text('⏰ ' + DateUtils.getRemainingTimeText(task.planFinishTime))
          .fontSize(12)
          .fontColor(task.isOverdue() ? Colors.STATUS_OVERDUE : Colors.TEXT_SECONDARY)
          .fontWeight(task.isOverdue() ? 600 : 400)
      }
      .width('100%')
    }
    .width('100%')
    .padding(16)
    .backgroundColor(Colors.BG_CARD)
    .borderRadius(14)
    .shadow({
      radius: 8,
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

