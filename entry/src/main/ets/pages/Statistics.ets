/**
 * 统计页面
 */

import router from '@ohos.router'
import { Colors, TaskStatus } from '../utils/Constants'
import { DatabaseManager } from '../database/DatabaseManager'
import { Task } from '../models/Task'
import { Statistics } from '../models/User'
import { DateUtils } from '../utils/DateUtils'

@Entry
@Component
struct StatisticsPage {
  @State statistics: Statistics = new Statistics()
  @State recentCompletedTasks: Task[] = []
  @State overdueTasksList: Task[] = []
  private dbManager: DatabaseManager | null = null

  async aboutToAppear() {
    this.dbManager = DatabaseManager.getInstance(getContext(this))
    await this.loadStatistics()
  }

  /**
   * 加载统计数据
   */
  async loadStatistics() {
    if (!this.dbManager) return

    const allTasks = await this.dbManager.queryAllTasks()
    
    // 计算统计数据
    this.statistics.totalTasks = allTasks.length
    this.statistics.completedTasks = allTasks.filter(t => t.status === TaskStatus.COMPLETED).length
    this.statistics.inProgressTasks = allTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length
    this.statistics.notStartedTasks = allTasks.filter(t => t.status === TaskStatus.NOT_STARTED).length
    this.statistics.overdueTasks = allTasks.filter(t => t.isOverdue() && t.status !== TaskStatus.COMPLETED).length
    
    // 计算完成率和逾期率
    this.statistics.calculateCompletionRate()
    this.statistics.calculateOverdueRate()
    
    // 计算平均完成天数
    const completedTasks = allTasks.filter(t => t.status === TaskStatus.COMPLETED && t.actualFinishTime > 0)
    if (completedTasks.length > 0) {
      const totalDays = completedTasks.reduce((sum, task) => {
        const days = Math.ceil((task.actualFinishTime - task.assignTime) / (1000 * 60 * 60 * 24))
        return sum + days
      }, 0)
      this.statistics.avgCompletionDays = Math.round(totalDays / completedTasks.length)
    }
    
    // 获取最近完成的任务
    this.recentCompletedTasks = completedTasks
      .sort((a, b) => b.actualFinishTime - a.actualFinishTime)
      .slice(0, 5)
    
    // 获取逾期任务
    this.overdueTasksList = allTasks
      .filter(t => t.isOverdue() && t.status !== TaskStatus.COMPLETED)
      .slice(0, 5)
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

        Text('数据统计')
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

      Scroll() {
        Column() {
          // 总览卡片
          Column() {
            Text('任务总览')
              .fontSize(18)
              .fontWeight(600)
              .fontColor(Colors.TEXT_PRIMARY)
              .width('100%')
              .margin({ bottom: 20 })

            Row() {
              this.StatItem('全部任务', this.statistics.totalTasks, '📋')
              this.StatItem('已完成', this.statistics.completedTasks, '✅')
            }
            .width('100%')
            .justifyContent(FlexAlign.SpaceBetween)
            .margin({ bottom: 15 })

            Row() {
              this.StatItem('进行中', this.statistics.inProgressTasks, '⚡')
              this.StatItem('已逾期', this.statistics.overdueTasks, '⚠️')
            }
            .width('100%')
            .justifyContent(FlexAlign.SpaceBetween)
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

          // 完成率卡片
          Column() {
            Text('完成率分析')
              .fontSize(18)
              .fontWeight(600)
              .fontColor(Colors.TEXT_PRIMARY)
              .width('100%')
              .margin({ bottom: 20 })

            // 完成率环形图（简化版）
            Column() {
              Text(`${this.statistics.completionRate}%`)
                .fontSize(48)
                .fontWeight(700)
                .fontColor(Colors.PRIMARY_START)
                .margin({ bottom: 8 })
              
              Text('任务完成率')
                .fontSize(14)
                .fontColor(Colors.TEXT_SECONDARY)
            }
            .width('100%')
            .height(160)
            .justifyContent(FlexAlign.Center)
            .backgroundColor('rgba(102, 126, 234, 0.05)')
            .borderRadius(12)
            .margin({ bottom: 15 })

            // 进度条
            Column() {
              Row() {
                Text('完成进度')
                  .fontSize(14)
                  .fontColor(Colors.TEXT_SECONDARY)
                
                Blank()
                
                Text(`${this.statistics.completedTasks}/${this.statistics.totalTasks}`)
                  .fontSize(14)
                  .fontColor(Colors.TEXT_PRIMARY)
                  .fontWeight(600)
              }
              .width('100%')
              .margin({ bottom: 8 })

              Row() {
                Row()
                  .width(`${this.statistics.completionRate}%`)
                  .height('100%')
                  .backgroundColor(Colors.STATUS_COMPLETED)
                  .borderRadius(6)
              }
              .width('100%')
              .height(12)
              .backgroundColor(Colors.BG_PRIMARY)
              .borderRadius(6)
            }
            .width('100%')
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

          // 效率指标
          Column() {
            Text('效率指标')
              .fontSize(18)
              .fontWeight(600)
              .fontColor(Colors.TEXT_PRIMARY)
              .width('100%')
              .margin({ bottom: 15 })

            Row() {
              Column() {
                Text('⏱️')
                  .fontSize(32)
                  .margin({ bottom: 8 })
                
                Text(`${this.statistics.avgCompletionDays}天`)
                  .fontSize(24)
                  .fontWeight(700)
                  .fontColor(Colors.TEXT_PRIMARY)
                  .margin({ bottom: 4 })
                
                Text('平均完成时长')
                  .fontSize(13)
                  .fontColor(Colors.TEXT_SECONDARY)
              }
              .layoutWeight(1)
              .padding(15)
              .backgroundColor('rgba(52, 152, 219, 0.08)')
              .borderRadius(12)

              Column() {
                Text('📊')
                  .fontSize(32)
                  .margin({ bottom: 8 })
                
                Text(`${this.statistics.overdueRate}%`)
                  .fontSize(24)
                  .fontWeight(700)
                  .fontColor(this.statistics.overdueRate > 20 ? Colors.STATUS_OVERDUE : Colors.TEXT_PRIMARY)
                  .margin({ bottom: 4 })
                
                Text('逾期率')
                  .fontSize(13)
                  .fontColor(Colors.TEXT_SECONDARY)
              }
              .layoutWeight(1)
              .padding(15)
              .backgroundColor('rgba(231, 76, 60, 0.08)')
              .borderRadius(12)
              .margin({ left: 12 })
            }
            .width('100%')
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

          // 最近完成
          if (this.recentCompletedTasks.length > 0) {
            Column() {
              Text('最近完成')
                .fontSize(18)
                .fontWeight(600)
                .fontColor(Colors.TEXT_PRIMARY)
                .width('100%')
                .margin({ bottom: 15 })

              Column({ space: 10 }) {
                ForEach(this.recentCompletedTasks, (task: Task) => {
                  this.CompletedTaskItem(task)
                })
              }
              .width('100%')
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
          }

          // 逾期任务
          if (this.overdueTasksList.length > 0) {
            Column() {
              Row() {
                Text('逾期任务')
                  .fontSize(18)
                  .fontWeight(600)
                  .fontColor(Colors.STATUS_OVERDUE)
                
                Text(`${this.overdueTasksList.length}`)
                  .fontSize(16)
                  .fontColor(Colors.TEXT_WHITE)
                  .padding({ left: 8, right: 8, top: 3, bottom: 3 })
                  .backgroundColor(Colors.STATUS_OVERDUE)
                  .borderRadius(10)
                  .margin({ left: 10 })
              }
              .width('100%')
              .margin({ bottom: 15 })

              Column({ space: 10 }) {
                ForEach(this.overdueTasksList, (task: Task) => {
                  this.OverdueTaskItem(task)
                })
              }
              .width('100%')
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
          }

          // 提示信息
          Row() {
            Text('💡')
              .fontSize(18)
              .margin({ right: 10 })
            
            Column() {
              Text('数据更新时间')
                .fontSize(12)
                .fontColor(Colors.TEXT_LIGHT)
                .margin({ bottom: 3 })
              
              Text(DateUtils.formatDate(DateUtils.now(), 'YYYY-MM-DD HH:mm'))
                .fontSize(13)
                .fontColor(Colors.TEXT_SECONDARY)
            }
            .alignItems(HorizontalAlign.Start)
          }
          .width('100%')
          .padding(15)
          .backgroundColor('rgba(149, 165, 166, 0.08)')
          .borderRadius(12)
        }
        .width('100%')
        .padding({ left: 20, right: 20, top: 20, bottom: 20 })
      }
      .layoutWeight(1)
      .backgroundColor(Colors.BG_PRIMARY)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Colors.BG_PRIMARY)
  }

  /**
   * 统计项组件
   */
  @Builder
  StatItem(label: string, value: number, icon: string) {
    Column() {
      Text(icon)
        .fontSize(28)
        .margin({ bottom: 8 })
      
      Text(value.toString())
        .fontSize(26)
        .fontWeight(700)
        .fontColor(Colors.TEXT_PRIMARY)
        .margin({ bottom: 4 })
      
      Text(label)
        .fontSize(13)
        .fontColor(Colors.TEXT_SECONDARY)
    }
    .width('48%')
    .height(110)
    .backgroundColor(Colors.BG_PRIMARY)
    .borderRadius(12)
    .justifyContent(FlexAlign.Center)
  }

  /**
   * 已完成任务项
   */
  @Builder
  CompletedTaskItem(task: Task) {
    Row() {
      Column() {
        Text(task.taskName)
          .fontSize(14)
          .fontWeight(500)
          .fontColor(Colors.TEXT_PRIMARY)
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .margin({ bottom: 4 })
        
        Text(`${task.assigneeName} · ${DateUtils.formatDate(task.actualFinishTime, 'MM月DD日')}完成`)
          .fontSize(12)
          .fontColor(Colors.TEXT_SECONDARY)
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)

      Text('✓')
        .fontSize(20)
        .fontColor(Colors.STATUS_COMPLETED)
        .fontWeight(700)
    }
    .width('100%')
    .padding(12)
    .backgroundColor(Colors.BG_PRIMARY)
    .borderRadius(10)
  }

  /**
   * 逾期任务项
   */
  @Builder
  OverdueTaskItem(task: Task) {
    Row() {
      Column() {
        Text(task.taskName)
          .fontSize(14)
          .fontWeight(500)
          .fontColor(Colors.TEXT_PRIMARY)
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .margin({ bottom: 4 })
        
        Text(`${task.assigneeName} · ${DateUtils.getRemainingTimeText(task.planFinishTime)}`)
          .fontSize(12)
          .fontColor(Colors.STATUS_OVERDUE)
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)

      Text('!')
        .fontSize(20)
        .fontColor(Colors.STATUS_OVERDUE)
        .fontWeight(700)
    }
    .width('100%')
    .padding(12)
    .backgroundColor('rgba(231, 76, 60, 0.05)')
    .borderRadius(10)
    .border({
      width: 1,
      color: 'rgba(231, 76, 60, 0.2)',
      radius: 10
    })
  }
}

