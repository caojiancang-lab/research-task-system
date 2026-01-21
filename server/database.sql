-- 科研任务管理系统数据库
-- MySQL 5.7+

CREATE DATABASE IF NOT EXISTS research_tasks CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE research_tasks;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(50) UNIQUE NOT NULL COMMENT '学号',
    name VARCHAR(100) NOT NULL COMMENT '姓名',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
    role VARCHAR(20) DEFAULT 'user' COMMENT '角色：admin/user',
    grade VARCHAR(20) COMMENT '年级',
    level VARCHAR(50) COMMENT '学历层次',
    school VARCHAR(100) COMMENT '学院',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    permissions JSON COMMENT '权限配置',
    token VARCHAR(255) COMMENT '登录令牌',
    register_time BIGINT COMMENT '注册时间戳',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_student_id (student_id),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 任务表
CREATE TABLE IF NOT EXISTS tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_number VARCHAR(50) COMMENT '任务编号',
    user_id INT COMMENT '创建者ID',
    assigner_id INT COMMENT '分派人ID',
    assignee_id INT COMMENT '接收人ID',
    name VARCHAR(200) NOT NULL COMMENT '任务名称',
    type VARCHAR(50) COMMENT '任务类型',
    priority VARCHAR(20) COMMENT '优先级',
    start_date DATE COMMENT '开始日期',
    deadline DATE COMMENT '截止日期',
    estimated_hours DECIMAL(10,2) COMMENT '预计工时',
    actual_hours DECIMAL(10,2) COMMENT '实际工时',
    description TEXT COMMENT '任务描述',
    steps JSON COMMENT '任务步骤',
    status VARCHAR(50) DEFAULT 'planning' COMMENT '状态',
    progress INT DEFAULT 0 COMMENT '进度百分比',
    create_time BIGINT COMMENT '创建时间戳',
    complete_time BIGINT COMMENT '完成时间戳',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigner_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_task_number (task_number),
    INDEX idx_user_id (user_id),
    INDEX idx_assignee_id (assignee_id),
    INDEX idx_status (status),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务表';

-- 周计划表
CREATE TABLE IF NOT EXISTS weekly_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL COMMENT '任务ID',
    week_start BIGINT COMMENT '周开始时间戳',
    week_end BIGINT COMMENT '周结束时间戳',
    last_week_content TEXT COMMENT '上周完成内容',
    this_week_content TEXT COMMENT '本周计划内容',
    next_week_content TEXT COMMENT '下周计划内容',
    content TEXT COMMENT '完整内容（JSON）',
    created_by VARCHAR(100) COMMENT '创建人学号',
    updated_by VARCHAR(100) COMMENT '更新人学号',
    approved BOOLEAN DEFAULT FALSE COMMENT '是否已审核',
    approved_by VARCHAR(100) COMMENT '审核人学号',
    submitted BOOLEAN DEFAULT FALSE COMMENT '是否已提交',
    create_time BIGINT COMMENT '创建时间戳',
    update_time BIGINT COMMENT '更新时间戳',
    approved_time BIGINT COMMENT '审核时间戳',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    INDEX idx_task_id (task_id),
    INDEX idx_week_start (week_start),
    INDEX idx_submitted (submitted),
    INDEX idx_approved (approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='周计划表';

-- 操作日志表
CREATE TABLE IF NOT EXISTS operation_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT COMMENT '操作用户ID',
    action VARCHAR(50) COMMENT '操作类型',
    target_type VARCHAR(50) COMMENT '目标类型',
    target_id INT COMMENT '目标ID',
    details TEXT COMMENT '操作详情',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 插入默认管理员账号
INSERT INTO users (student_id, name, password, role, permissions, register_time) VALUES
('20251100029', '管理员1', '$2b$10$YourHashedPasswordHere1', 'admin', 
 '{"view":true,"create":true,"edit":true,"delete":true,"manage":true,"createOtherTypes":true}', 
 UNIX_TIMESTAMP() * 1000),
('18109316679', '管理员2', '$2b$10$YourHashedPasswordHere2', 'admin', 
 '{"view":true,"create":true,"edit":true,"delete":true,"manage":true,"createOtherTypes":true}', 
 UNIX_TIMESTAMP() * 1000);

-- 创建视图：任务详情视图
CREATE OR REPLACE VIEW v_task_details AS
SELECT 
    t.*,
    u1.name as creator_name,
    u2.name as assigner_name,
    u3.name as assignee_name
FROM tasks t
LEFT JOIN users u1 ON t.user_id = u1.id
LEFT JOIN users u2 ON t.assigner_id = u2.id
LEFT JOIN users u3 ON t.assignee_id = u3.id;

-- 创建视图：周计划详情视图
CREATE OR REPLACE VIEW v_weekly_plan_details AS
SELECT 
    wp.*,
    t.name as task_name,
    t.type as task_type,
    u1.name as creator_name,
    u2.name as updater_name,
    u3.name as approver_name
FROM weekly_plans wp
LEFT JOIN tasks t ON wp.task_id = t.id
LEFT JOIN users u1 ON wp.created_by = u1.student_id
LEFT JOIN users u2 ON wp.updated_by = u2.student_id
LEFT JOIN users u3 ON wp.approved_by = u3.student_id;


