/**
 * 数据库管理类
 */

import relationalStore from '@ohos.data.relationalStore'
import { Task } from '../models/Task'
import { Feedback } from '../models/Feedback'
import { DatabaseConfig } from '../utils/Constants'

export class DatabaseManager {
  private static instance: DatabaseManager
  private store: relationalStore.RdbStore | null = null
  private context: Context

  private constructor(context: Context) {
    this.context = context
  }

  /**
   * 获取单例
   */
  static getInstance(context: Context): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager(context)
    }
    return DatabaseManager.instance
  }

  /**
   * 初始化数据库
   */
  async initDatabase(): Promise<void> {
    const config: relationalStore.StoreConfig = {
      name: DatabaseConfig.DB_NAME,
      securityLevel: relationalStore.SecurityLevel.S1
    }

    try {
      this.store = await relationalStore.getRdbStore(this.context, config)
      await this.createTables()
      console.info('数据库初始化成功')
    } catch (err) {
      console.error('数据库初始化失败:', JSON.stringify(err))
    }
  }

  /**
   * 创建表
   */
  private async createTables(): Promise<void> {
    if (!this.store) return

    // 创建任务表
    const createTaskTable = `
      CREATE TABLE IF NOT EXISTS ${DatabaseConfig.TABLE_TASK} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        taskName TEXT NOT NULL,
        taskDescription TEXT,
        assignerName TEXT NOT NULL,
        assigneeName TEXT NOT NULL,
        assignTime INTEGER NOT NULL,
        planFinishTime INTEGER NOT NULL,
        actualFinishTime INTEGER DEFAULT 0,
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        createTime INTEGER NOT NULL,
        updateTime INTEGER NOT NULL,
        tags TEXT,
        remarks TEXT
      )
    `

    // 创建反馈表
    const createFeedbackTable = `
      CREATE TABLE IF NOT EXISTS ${DatabaseConfig.TABLE_FEEDBACK} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        taskId INTEGER NOT NULL,
        feedbackContent TEXT NOT NULL,
        feedbackTime INTEGER NOT NULL,
        feedbackType TEXT NOT NULL,
        feedbackPerson TEXT NOT NULL,
        attachments TEXT,
        isRead INTEGER DEFAULT 0,
        replyContent TEXT,
        replyTime INTEGER DEFAULT 0,
        replyPerson TEXT,
        FOREIGN KEY (taskId) REFERENCES ${DatabaseConfig.TABLE_TASK}(id)
      )
    `

    try {
      await this.store.executeSql(createTaskTable)
      await this.store.executeSql(createFeedbackTable)
      console.info('数据表创建成功')
    } catch (err) {
      console.error('数据表创建失败:', JSON.stringify(err))
    }
  }

  /**
   * 插入任务
   */
  async insertTask(task: Task): Promise<number> {
    if (!this.store) return -1

    const valueBucket = task.toDbObject()
    try {
      const rowId = await this.store.insert(DatabaseConfig.TABLE_TASK, valueBucket)
      console.info('任务插入成功, ID:', rowId)
      return rowId
    } catch (err) {
      console.error('任务插入失败:', JSON.stringify(err))
      return -1
    }
  }

  /**
   * 更新任务
   */
  async updateTask(task: Task): Promise<boolean> {
    if (!this.store) return false

    const valueBucket = task.toDbObject()
    const predicates = new relationalStore.RdbPredicates(DatabaseConfig.TABLE_TASK)
    predicates.equalTo('id', task.id)

    try {
      const rows = await this.store.update(valueBucket, predicates)
      console.info('任务更新成功, 影响行数:', rows)
      return rows > 0
    } catch (err) {
      console.error('任务更新失败:', JSON.stringify(err))
      return false
    }
  }

  /**
   * 删除任务
   */
  async deleteTask(taskId: number): Promise<boolean> {
    if (!this.store) return false

    const predicates = new relationalStore.RdbPredicates(DatabaseConfig.TABLE_TASK)
    predicates.equalTo('id', taskId)

    try {
      const rows = await this.store.delete(predicates)
      // 同时删除相关反馈
      await this.deleteFeedbacksByTaskId(taskId)
      console.info('任务删除成功, 影响行数:', rows)
      return rows > 0
    } catch (err) {
      console.error('任务删除失败:', JSON.stringify(err))
      return false
    }
  }

  /**
   * 查询所有任务
   */
  async queryAllTasks(): Promise<Task[]> {
    if (!this.store) return []

    const predicates = new relationalStore.RdbPredicates(DatabaseConfig.TABLE_TASK)
    predicates.orderByDesc('createTime')

    try {
      const resultSet = await this.store.query(predicates)
      const tasks: Task[] = []

      while (resultSet.goToNextRow()) {
        const task = this.resultSetToTask(resultSet)
        tasks.push(task)
      }

      resultSet.close()
      return tasks
    } catch (err) {
      console.error('查询任务失败:', JSON.stringify(err))
      return []
    }
  }

  /**
   * 根据ID查询任务
   */
  async queryTaskById(taskId: number): Promise<Task | null> {
    if (!this.store) return null

    const predicates = new relationalStore.RdbPredicates(DatabaseConfig.TABLE_TASK)
    predicates.equalTo('id', taskId)

    try {
      const resultSet = await this.store.query(predicates)
      let task: Task | null = null

      if (resultSet.goToFirstRow()) {
        task = this.resultSetToTask(resultSet)
      }

      resultSet.close()
      return task
    } catch (err) {
      console.error('查询任务失败:', JSON.stringify(err))
      return null
    }
  }

  /**
   * 根据状态查询任务
   */
  async queryTasksByStatus(status: string): Promise<Task[]> {
    if (!this.store) return []

    const predicates = new relationalStore.RdbPredicates(DatabaseConfig.TABLE_TASK)
    predicates.equalTo('status', status)
    predicates.orderByDesc('createTime')

    try {
      const resultSet = await this.store.query(predicates)
      const tasks: Task[] = []

      while (resultSet.goToNextRow()) {
        const task = this.resultSetToTask(resultSet)
        tasks.push(task)
      }

      resultSet.close()
      return tasks
    } catch (err) {
      console.error('查询任务失败:', JSON.stringify(err))
      return []
    }
  }

  /**
   * 插入反馈
   */
  async insertFeedback(feedback: Feedback): Promise<number> {
    if (!this.store) return -1

    const valueBucket = feedback.toDbObject()
    try {
      const rowId = await this.store.insert(DatabaseConfig.TABLE_FEEDBACK, valueBucket)
      console.info('反馈插入成功, ID:', rowId)
      return rowId
    } catch (err) {
      console.error('反馈插入失败:', JSON.stringify(err))
      return -1
    }
  }

  /**
   * 更新反馈
   */
  async updateFeedback(feedback: Feedback): Promise<boolean> {
    if (!this.store) return false

    const valueBucket = feedback.toDbObject()
    const predicates = new relationalStore.RdbPredicates(DatabaseConfig.TABLE_FEEDBACK)
    predicates.equalTo('id', feedback.id)

    try {
      const rows = await this.store.update(valueBucket, predicates)
      console.info('反馈更新成功, 影响行数:', rows)
      return rows > 0
    } catch (err) {
      console.error('反馈更新失败:', JSON.stringify(err))
      return false
    }
  }

  /**
   * 查询任务的所有反馈
   */
  async queryFeedbacksByTaskId(taskId: number): Promise<Feedback[]> {
    if (!this.store) return []

    const predicates = new relationalStore.RdbPredicates(DatabaseConfig.TABLE_FEEDBACK)
    predicates.equalTo('taskId', taskId)
    predicates.orderByDesc('feedbackTime')

    try {
      const resultSet = await this.store.query(predicates)
      const feedbacks: Feedback[] = []

      while (resultSet.goToNextRow()) {
        const feedback = this.resultSetToFeedback(resultSet)
        feedbacks.push(feedback)
      }

      resultSet.close()
      return feedbacks
    } catch (err) {
      console.error('查询反馈失败:', JSON.stringify(err))
      return []
    }
  }

  /**
   * 删除任务的所有反馈
   */
  async deleteFeedbacksByTaskId(taskId: number): Promise<boolean> {
    if (!this.store) return false

    const predicates = new relationalStore.RdbPredicates(DatabaseConfig.TABLE_FEEDBACK)
    predicates.equalTo('taskId', taskId)

    try {
      const rows = await this.store.delete(predicates)
      console.info('反馈删除成功, 影响行数:', rows)
      return rows > 0
    } catch (err) {
      console.error('反馈删除失败:', JSON.stringify(err))
      return false
    }
  }

  /**
   * ResultSet转Task对象
   */
  private resultSetToTask(resultSet: relationalStore.ResultSet): Task {
    return Task.fromDbObject({
      id: resultSet.getLong(resultSet.getColumnIndex('id')),
      taskName: resultSet.getString(resultSet.getColumnIndex('taskName')),
      taskDescription: resultSet.getString(resultSet.getColumnIndex('taskDescription')),
      assignerName: resultSet.getString(resultSet.getColumnIndex('assignerName')),
      assigneeName: resultSet.getString(resultSet.getColumnIndex('assigneeName')),
      assignTime: resultSet.getLong(resultSet.getColumnIndex('assignTime')),
      planFinishTime: resultSet.getLong(resultSet.getColumnIndex('planFinishTime')),
      actualFinishTime: resultSet.getLong(resultSet.getColumnIndex('actualFinishTime')),
      status: resultSet.getString(resultSet.getColumnIndex('status')),
      priority: resultSet.getString(resultSet.getColumnIndex('priority')),
      createTime: resultSet.getLong(resultSet.getColumnIndex('createTime')),
      updateTime: resultSet.getLong(resultSet.getColumnIndex('updateTime')),
      tags: resultSet.getString(resultSet.getColumnIndex('tags')),
      remarks: resultSet.getString(resultSet.getColumnIndex('remarks'))
    })
  }

  /**
   * ResultSet转Feedback对象
   */
  private resultSetToFeedback(resultSet: relationalStore.ResultSet): Feedback {
    return Feedback.fromDbObject({
      id: resultSet.getLong(resultSet.getColumnIndex('id')),
      taskId: resultSet.getLong(resultSet.getColumnIndex('taskId')),
      feedbackContent: resultSet.getString(resultSet.getColumnIndex('feedbackContent')),
      feedbackTime: resultSet.getLong(resultSet.getColumnIndex('feedbackTime')),
      feedbackType: resultSet.getString(resultSet.getColumnIndex('feedbackType')),
      feedbackPerson: resultSet.getString(resultSet.getColumnIndex('feedbackPerson')),
      attachments: resultSet.getString(resultSet.getColumnIndex('attachments')),
      isRead: resultSet.getLong(resultSet.getColumnIndex('isRead')),
      replyContent: resultSet.getString(resultSet.getColumnIndex('replyContent')),
      replyTime: resultSet.getLong(resultSet.getColumnIndex('replyTime')),
      replyPerson: resultSet.getString(resultSet.getColumnIndex('replyPerson'))
    })
  }
}

