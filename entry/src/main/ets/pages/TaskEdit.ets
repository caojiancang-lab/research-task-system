/**
 * 编辑任务页面
 */

import router from '@ohos.router'
import { Colors, TaskPriority } from '../utils/Constants'
import { DatabaseManager } from '../database/DatabaseManager'
import { Task } from '../models/Task'
import { DateUtils } from '../utils/DateUtils'
import promptAction from '@ohos.promptAction'

@Entry
@Component
struct TaskEdit {
  @State task: Task | null = null
  @State taskName: string = ''
  @State taskDescription: string = ''
  @State assignerName: string = ''
  @State assigneeName: string = ''
  @State selectedPriority: string = TaskPriority.MEDIUM
  @State planFinishDate: string = ''
  @State tags: string = ''
  @State remarks: string = ''
  @State isSubmitting: boolean = false
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
    await this.loadTask()
  }

  /**
   * 加载任务数据
   */
  async loadTask() {
    if (!this.dbManager) return

    this.task = await this.dbManager.queryTaskById(this.taskId)
    
    if (this.task) {
      this.taskName = this.task.taskName
      this.taskDescription = this.task.taskDescription
      this.assignerName = this.task.assignerName
      this.assigneeName = this.task.assigneeName
      this.selectedPriority = this.task.priority
      this.planFinishDate = DateUtils.formatDate(this.task.planFinishTime, 'YYYY-MM-DD')
      this.tags = this.task.tags
      this.remarks = this.task.remarks
    }
  }

  /**
   * 验证表单
   */
  validateForm(): boolean {
    if (!this.taskName.trim()) {
      promptAction.showToast({ message: '请输入任务名称', duration: 2000 })
      return false
    }
    
    if (!this.assignerName.trim()) {
      promptAction.showToast({ message: '请输入指派人姓名', duration: 2000 })
      return false
    }
    
    if (!this.assigneeName.trim()) {
      promptAction.showToast({ message: '请输入执行人姓名', duration: 2000 })
      return false
    }
    
    if (!this.planFinishDate) {
      promptAction.showToast({ message: '请选择计划完成时间', duration: 2000 })
      return false
    }
    
    return true
  }

  /**
   * 更新任务
   */
  async updateTask() {
    if (!this.validateForm() || !this.task) {
      return
    }

    if (this.isSubmitting) {
      return
    }

    this.isSubmitting = true

    const planFinishTime = DateUtils.parseDate(this.planFinishDate + ' 23:59:59')

    this.task.taskName = this.taskName.trim()
    this.task.taskDescription = this.taskDescription.trim()
    this.task.assignerName = this.assignerName.trim()
    this.task.assigneeName = this.assigneeName.trim()
    this.task.planFinishTime = planFinishTime
    this.task.priority = this.selectedPriority
    this.task.updateTime = DateUtils.now()
    this.task.tags = this.tags.trim()
    this.task.remarks = this.remarks.trim()

    if (this.dbManager) {
      const success = await this.dbManager.updateTask(this.task)
      
      if (success) {
        promptAction.showToast({ message: '任务更新成功', duration: 2000 })
        
        setTimeout(() => {
          router.back()
        }, 500)
      } else {
        promptAction.showToast({ message: '任务更新失败', duration: 2000 })
        this.isSubmitting = false
      }
    }
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

        Text('编辑任务')
          .fontSize(22)
          .fontWeight(600)
          .fontColor(Colors.TEXT_WHITE)
          .margin({ left: 15 })
      }
      .width('100%')
      .padding({ left: 20, right: 20, top: 15, bottom: 15 })
      .linearGradient({
        angle: 135,
        colors: [[Colors.BG_GRADIENT_START, 0.0], [Colors.BG_GRADIENT_END, 1.0]]
      })

      // 表单内容
      Scroll() {
        Column() {
          // 任务名称
          this.FormSection('任务名称', true)
          TextInput({ text: this.taskName })
            .width('100%')
            .height(50)
            .fontSize(15)
            .backgroundColor(Colors.BG_CARD)
            .borderRadius(12)
            .margin({ bottom: 20 })
            .onChange((value: string) => {
              this.taskName = value
            })

          // 指派人
          this.FormSection('指派人', true)
          TextInput({ text: this.assignerName })
            .width('100%')
            .height(50)
            .fontSize(15)
            .backgroundColor(Colors.BG_CARD)
            .borderRadius(12)
            .margin({ bottom: 20 })
            .onChange((value: string) => {
              this.assignerName = value
            })

          // 执行人
          this.FormSection('执行人', true)
          TextInput({ text: this.assigneeName })
            .width('100%')
            .height(50)
            .fontSize(15)
            .backgroundColor(Colors.BG_CARD)
            .borderRadius(12)
            .margin({ bottom: 20 })
            .onChange((value: string) => {
              this.assigneeName = value
            })

          // 任务描述
          this.FormSection('任务要求', false)
          TextArea({ text: this.taskDescription })
            .width('100%')
            .height(120)
            .fontSize(15)
            .backgroundColor(Colors.BG_CARD)
            .borderRadius(12)
            .margin({ bottom: 20 })
            .onChange((value: string) => {
              this.taskDescription = value
            })

          // 优先级
          this.FormSection('优先级', true)
          Row() {
            this.PriorityChip(TaskPriority.LOW)
            this.PriorityChip(TaskPriority.MEDIUM)
            this.PriorityChip(TaskPriority.HIGH)
            this.PriorityChip(TaskPriority.URGENT)
          }
          .width('100%')
          .margin({ bottom: 20 })

          // 计划完成时间
          this.FormSection('计划完成时间', true)
          TextInput({ text: this.planFinishDate })
            .width('100%')
            .height(50)
            .fontSize(15)
            .backgroundColor(Colors.BG_CARD)
            .borderRadius(12)
            .margin({ bottom: 20 })
            .type(InputType.Normal)
            .onChange((value: string) => {
              this.planFinishDate = value
            })

          // 标签
          this.FormSection('标签', false)
          TextInput({ text: this.tags })
            .width('100%')
            .height(50)
            .fontSize(15)
            .backgroundColor(Colors.BG_CARD)
            .borderRadius(12)
            .margin({ bottom: 20 })
            .onChange((value: string) => {
              this.tags = value
            })

          // 备注
          this.FormSection('备注', false)
          TextArea({ text: this.remarks })
            .width('100%')
            .height(100)
            .fontSize(15)
            .backgroundColor(Colors.BG_CARD)
            .borderRadius(12)
            .margin({ bottom: 30 })
            .onChange((value: string) => {
              this.remarks = value
            })
        }
        .width('100%')
        .padding({ left: 20, right: 20, top: 20, bottom: 20 })
      }
      .layoutWeight(1)
      .backgroundColor(Colors.BG_PRIMARY)

      // 提交按钮
      Button(this.isSubmitting ? '保存中...' : '保存修改')
        .width('90%')
        .height(50)
        .fontSize(18)
        .fontWeight(600)
        .backgroundColor(this.isSubmitting ? Colors.TEXT_LIGHT : Colors.PRIMARY_START)
        .borderRadius(25)
        .margin({ top: 10, bottom: 20 })
        .enabled(!this.isSubmitting)
        .onClick(() => this.updateTask())
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Colors.BG_PRIMARY)
  }

  /**
   * 表单标题组件
   */
  @Builder
  FormSection(title: string, required: boolean) {
    Row() {
      Text(title)
        .fontSize(15)
        .fontWeight(600)
        .fontColor(Colors.TEXT_PRIMARY)
      
      if (required) {
        Text(' *')
          .fontSize(15)
          .fontColor(Colors.STATUS_OVERDUE)
      }
    }
    .margin({ bottom: 10 })
  }

  /**
   * 优先级选择组件
   */
  @Builder
  PriorityChip(priority: string) {
    Text(priority)
      .fontSize(14)
      .fontColor(this.selectedPriority === priority ? Colors.TEXT_WHITE : this.getPriorityColor(priority))
      .padding({ left: 16, right: 16, top: 10, bottom: 10 })
      .backgroundColor(this.selectedPriority === priority ? this.getPriorityColor(priority) : Colors.BG_CARD)
      .borderRadius(20)
      .border({
        width: 1,
        color: this.getPriorityColor(priority)
      })
      .margin({ right: 10 })
      .onClick(() => {
        this.selectedPriority = priority
      })
  }

  /**
   * 获取优先级颜色
   */
  getPriorityColor(priority: string): string {
    switch (priority) {
      case TaskPriority.LOW:
        return Colors.PRIORITY_LOW
      case TaskPriority.MEDIUM:
        return Colors.PRIORITY_MEDIUM
      case TaskPriority.HIGH:
        return Colors.PRIORITY_HIGH
      case TaskPriority.URGENT:
        return Colors.PRIORITY_URGENT
      default:
        return Colors.PRIORITY_MEDIUM
    }
  }
}

