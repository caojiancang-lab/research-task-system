/**
 * 反馈页面
 */

import router from '@ohos.router'
import { Colors, FeedbackType } from '../utils/Constants'
import { DatabaseManager } from '../database/DatabaseManager'
import { Feedback } from '../models/Feedback'
import { DateUtils } from '../utils/DateUtils'
import promptAction from '@ohos.promptAction'

@Entry
@Component
struct FeedbackPage {
  @State feedbackContent: string = ''
  @State selectedType: string = FeedbackType.PROGRESS
  @State feedbackPerson: string = ''
  @State isSubmitting: boolean = false
  private taskId: number = 0
  private taskName: string = ''
  private dbManager: DatabaseManager | null = null

  async aboutToAppear() {
    // 获取路由参数
    const params = router.getParams() as Record<string, Object>
    if (params) {
      this.taskId = params.taskId as number
      this.taskName = params.taskName as string
    }

    // 初始化数据库
    this.dbManager = DatabaseManager.getInstance(getContext(this))
  }

  /**
   * 验证表单
   */
  validateForm(): boolean {
    if (!this.feedbackPerson.trim()) {
      promptAction.showToast({ message: '请输入反馈人姓名', duration: 2000 })
      return false
    }
    
    if (!this.feedbackContent.trim()) {
      promptAction.showToast({ message: '请输入反馈内容', duration: 2000 })
      return false
    }
    
    return true
  }

  /**
   * 提交反馈
   */
  async submitFeedback() {
    if (!this.validateForm()) {
      return
    }

    if (this.isSubmitting) {
      return
    }

    this.isSubmitting = true

    const feedback = new Feedback({
      taskId: this.taskId,
      feedbackContent: this.feedbackContent.trim(),
      feedbackTime: DateUtils.now(),
      feedbackType: this.selectedType,
      feedbackPerson: this.feedbackPerson.trim(),
      isRead: 0
    })

    if (this.dbManager) {
      const feedbackId = await this.dbManager.insertFeedback(feedback)
      
      if (feedbackId > 0) {
        promptAction.showToast({ message: '反馈提交成功', duration: 2000 })
        
        setTimeout(() => {
          router.back()
        }, 500)
      } else {
        promptAction.showToast({ message: '反馈提交失败', duration: 2000 })
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

        Column() {
          Text('添加反馈')
            .fontSize(22)
            .fontWeight(600)
            .fontColor(Colors.TEXT_WHITE)
          
          if (this.taskName) {
            Text(this.taskName)
              .fontSize(13)
              .fontColor('rgba(255, 255, 255, 0.85)')
              .maxLines(1)
              .textOverflow({ overflow: TextOverflow.Ellipsis })
              .margin({ top: 3 })
          }
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)
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
          // 反馈人
          this.FormSection('反馈人', true)
          TextInput({ placeholder: '请输入您的姓名' })
            .width('100%')
            .height(50)
            .fontSize(15)
            .backgroundColor(Colors.BG_CARD)
            .borderRadius(12)
            .margin({ bottom: 20 })
            .onChange((value: string) => {
              this.feedbackPerson = value
            })

          // 反馈类型
          this.FormSection('反馈类型', true)
          Row() {
            this.TypeChip(FeedbackType.PROGRESS)
            this.TypeChip(FeedbackType.ISSUE)
            this.TypeChip(FeedbackType.COMPLETION)
            this.TypeChip(FeedbackType.QUESTION)
          }
          .width('100%')
          .margin({ bottom: 20 })

          // 反馈内容
          this.FormSection('反馈内容', true)
          TextArea({ placeholder: '请详细描述您的反馈内容...\n\n例如：\n- 当前进度和完成情况\n- 遇到的问题和困难\n- 需要的支持和资源\n- 下一步计划' })
            .width('100%')
            .height(280)
            .fontSize(15)
            .backgroundColor(Colors.BG_CARD)
            .borderRadius(12)
            .margin({ bottom: 20 })
            .onChange((value: string) => {
              this.feedbackContent = value
            })

          // 提示信息
          Row() {
            Text('💡')
              .fontSize(16)
              .margin({ right: 8 })
            
            Text('及时反馈有助于任务顺利推进')
              .fontSize(13)
              .fontColor(Colors.TEXT_SECONDARY)
              .lineHeight(20)
          }
          .width('100%')
          .padding(12)
          .backgroundColor('rgba(102, 126, 234, 0.08)')
          .borderRadius(10)
          .margin({ bottom: 30 })
        }
        .width('100%')
        .padding({ left: 20, right: 20, top: 20, bottom: 20 })
      }
      .layoutWeight(1)
      .backgroundColor(Colors.BG_PRIMARY)

      // 提交按钮
      Button(this.isSubmitting ? '提交中...' : '提交反馈')
        .width('90%')
        .height(50)
        .fontSize(18)
        .fontWeight(600)
        .backgroundColor(this.isSubmitting ? Colors.TEXT_LIGHT : Colors.PRIMARY_START)
        .borderRadius(25)
        .margin({ top: 10, bottom: 20 })
        .enabled(!this.isSubmitting)
        .onClick(() => this.submitFeedback())
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
   * 类型选择组件
   */
  @Builder
  TypeChip(type: string) {
    Text(type)
      .fontSize(13)
      .fontColor(this.selectedType === type ? Colors.TEXT_WHITE : Colors.TEXT_PRIMARY)
      .padding({ left: 14, right: 14, top: 9, bottom: 9 })
      .backgroundColor(this.selectedType === type ? Colors.PRIMARY_START : Colors.BG_CARD)
      .borderRadius(18)
      .border({
        width: this.selectedType === type ? 0 : 1,
        color: Colors.TEXT_LIGHT
      })
      .margin({ right: 8, bottom: 8 })
      .onClick(() => {
        this.selectedType = type
      })
  }
}

