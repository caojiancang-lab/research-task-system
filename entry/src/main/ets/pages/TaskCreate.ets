/**
 * 创建任务页面
 */

import router from '@ohos.router'
import { Colors, TaskStatus, TaskPriority } from '../utils/Constants'
import { DatabaseManager } from '../database/DatabaseManager'
import { Task } from '../models/Task'
import { DateUtils } from '../utils/DateUtils'
import promptAction from '@ohos.promptAction'

@Entry
@Component
struct TaskCreate {
  @State taskName: string = ''
  @State taskDescription: string = ''
  @State assignerName: string = ''
  @State assigneeName: string = ''
  @State selectedPriority: string = TaskPriority.MEDIUM
  @State planFinishDate: string = ''
  @State tags: string = ''
  @State remarks: string = ''
  @State isSubmitting: boolean = false
  
  private dbManager: DatabaseManager | null = null

  async aboutToAppear() {
    this.dbManager = DatabaseManager.getInstance(getContext(this))
    
    // 设置默认完成日期为7天后
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 7)
    this.planFinishDate = this.formatDateForInput(defaultDate)
  }

  /**
   * 格式化日期为输入框格式
   */
  formatDateForInput(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
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
   * 提交任务
   */
  async submitTask() {
    if (!this.validateForm()) {
      return
    }

    if (this.isSubmitting) {
      return
    }

    this.isSubmitting = true

    const now = DateUtils.now()
    const planFinishTime = DateUtils.parseDate(this.planFinishDate + ' 23:59:59')

    const task = new Task({
      taskName: this.taskName.trim(),
      taskDescription: this.taskDescription.trim(),
      assignerName: this.assignerName.trim(),
      assigneeName: this.assigneeName.trim(),
      assignTime: now,
      planFinishTime: planFinishTime,
      status: TaskStatus.NOT_STARTED,
      priority: this.selectedPriority,
      createTime: now,
      updateTime: now,
      tags: this.tags.trim(),
      remarks: this.remarks.trim()
    })

    if (this.dbManager) {
      const taskId = await this.dbManager.insertTask(task)
      
      if (taskId > 0) {
        promptAction.showToast({ message: '任务创建成功', duration: 2000 })
        
        // 延迟返回，让用户看到提示
        setTimeout(() => {
          router.back()
        }, 500)
      } else {
        promptAction.showToast({ message: '任务创建失败', duration: 2000 })
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

        Text('创建任务')
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
          TextInput({ placeholder: '请输入任务名称' })
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
          TextInput({ placeholder: '请输入指派人姓名' })
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
          TextInput({ placeholder: '请输入执行人姓名' })
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
          TextArea({ placeholder: '请详细描述任务的具体要求和目标...' })
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
          TextInput({ placeholder: '多个标签用逗号分隔，如：实验,数据分析' })
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
          TextArea({ placeholder: '其他补充说明...' })
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
      Button(this.isSubmitting ? '提交中...' : '创建任务')
        .width('90%')
        .height(50)
        .fontSize(18)
        .fontWeight(600)
        .backgroundColor(this.isSubmitting ? Colors.TEXT_LIGHT : Colors.PRIMARY_START)
        .borderRadius(25)
        .margin({ top: 10, bottom: 20 })
        .enabled(!this.isSubmitting)
        .onClick(() => this.submitTask())
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

