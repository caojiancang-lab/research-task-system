/**
 * 常量定义
 */

// 任务状态
export enum TaskStatus {
  NOT_STARTED = '待开始',
  IN_PROGRESS = '进行中',
  COMPLETED = '已完成',
  OVERDUE = '已逾期'
}

// 任务优先级
export enum TaskPriority {
  LOW = '低',
  MEDIUM = '中',
  HIGH = '高',
  URGENT = '紧急'
}

// 反馈类型
export enum FeedbackType {
  PROGRESS = '进度更新',
  ISSUE = '问题反馈',
  COMPLETION = '完成汇报',
  QUESTION = '疑问咨询'
}

// 颜色常量
export class Colors {
  // 主题色 - 科技蓝紫渐变
  static readonly PRIMARY_START = '#667eea'
  static readonly PRIMARY_END = '#764ba2'
  static readonly ACCENT = '#f093fb'
  
  // 状态颜色
  static readonly STATUS_NOT_STARTED = '#95a5a6'
  static readonly STATUS_IN_PROGRESS = '#3498db'
  static readonly STATUS_COMPLETED = '#2ecc71'
  static readonly STATUS_OVERDUE = '#e74c3c'
  
  // 优先级颜色
  static readonly PRIORITY_LOW = '#95a5a6'
  static readonly PRIORITY_MEDIUM = '#f39c12'
  static readonly PRIORITY_HIGH = '#e67e22'
  static readonly PRIORITY_URGENT = '#c0392b'
  
  // 背景色
  static readonly BG_PRIMARY = '#f8f9fa'
  static readonly BG_CARD = '#ffffff'
  static readonly BG_GRADIENT_START = '#667eea'
  static readonly BG_GRADIENT_END = '#764ba2'
  
  // 文字颜色
  static readonly TEXT_PRIMARY = '#2c3e50'
  static readonly TEXT_SECONDARY = '#7f8c8d'
  static readonly TEXT_LIGHT = '#bdc3c7'
  static readonly TEXT_WHITE = '#ffffff'
}

// 数据库常量
export class DatabaseConfig {
  static readonly DB_NAME = 'ResearchTaskDB.db'
  static readonly DB_VERSION = 1
  static readonly TABLE_TASK = 'task'
  static readonly TABLE_FEEDBACK = 'feedback'
}

// 页面路由
export class Routes {
  static readonly INDEX = 'pages/Index'
  static readonly TASK_LIST = 'pages/TaskList'
  static readonly TASK_CREATE = 'pages/TaskCreate'
  static readonly TASK_DETAIL = 'pages/TaskDetail'
  static readonly TASK_EDIT = 'pages/TaskEdit'
  static readonly FEEDBACK_PAGE = 'pages/FeedbackPage'
  static readonly STATISTICS = 'pages/Statistics'
}

// 时间格式
export class DateFormat {
  static readonly FULL = 'YYYY-MM-DD HH:mm:ss'
  static readonly DATE = 'YYYY-MM-DD'
  static readonly TIME = 'HH:mm'
  static readonly MONTH_DAY = 'MM月DD日'
}

