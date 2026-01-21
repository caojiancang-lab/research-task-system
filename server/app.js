// 后端API服务器
// 使用Node.js + Express + MySQL

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your-secret-key-change-this'; // 请修改为随机密钥

// 中间件
app.use(cors());
app.use(express.json());

// 数据库连接池
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'your_password', // 修改为您的MySQL密码
    database: 'research_tasks',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// JWT验证中间件
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: '未授权访问' });
    }
    
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: '令牌无效' });
        }
        req.user = user;
        next();
    });
};

// ==================== 用户相关API ====================

// 用户注册
app.post('/api/register', async (req, res) => {
    try {
        const { studentId, name, password, grade, level, school, phone, email } = req.body;
        
        // 检查学号是否已存在
        const [existing] = await pool.query(
            'SELECT id FROM users WHERE student_id = ?',
            [studentId]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ error: '该学号已被注册' });
        }
        
        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 生成token
        const token = Buffer.from(`${studentId}:${Date.now()}`).toString('base64');
        
        // 插入用户
        const [result] = await pool.query(
            `INSERT INTO users (student_id, name, password, grade, level, school, phone, email, 
             role, permissions, token, register_time) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'user', ?, ?, ?)`,
            [
                studentId, name, hashedPassword, grade, level, school, phone, email,
                JSON.stringify({ create: true, edit: true, view: true }),
                token,
                Date.now()
            ]
        );
        
        res.json({
            success: true,
            message: '注册成功',
            userId: result.insertId
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ error: '注册失败' });
    }
});

// 用户登录
app.post('/api/login', async (req, res) => {
    try {
        const { studentId, password } = req.body;
        
        // 查询用户
        const [users] = await pool.query(
            'SELECT * FROM users WHERE student_id = ?',
            [studentId]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ error: '学号或密码错误' });
        }
        
        const user = users[0];
        
        // 验证密码
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: '学号或密码错误' });
        }
        
        // 生成JWT
        const jwtToken = jwt.sign(
            { userId: user.id, studentId: user.student_id, role: user.role },
            SECRET_KEY,
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            token: jwtToken,
            user: {
                id: user.id,
                studentId: user.student_id,
                name: user.name,
                role: user.role,
                grade: user.grade,
                level: user.level,
                school: user.school,
                phone: user.phone,
                email: user.email,
                permissions: JSON.parse(user.permissions || '{}')
            }
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ error: '登录失败' });
    }
});

// 获取用户列表（管理员）
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: '权限不足' });
        }
        
        const [users] = await pool.query(
            'SELECT id, student_id, name, role, grade, level, school, phone, email, permissions, register_time FROM users'
        );
        
        res.json({
            success: true,
            users: users.map(u => ({
                ...u,
                permissions: JSON.parse(u.permissions || '{}')
            }))
        });
    } catch (error) {
        console.error('获取用户列表错误:', error);
        res.status(500).json({ error: '获取用户列表失败' });
    }
});

// ==================== 任务相关API ====================

// 获取任务列表
app.get('/api/tasks', authenticateToken, async (req, res) => {
    try {
        const [tasks] = await pool.query(
            `SELECT t.*, 
             u1.name as assigner_name, 
             u2.name as assignee_name
             FROM tasks t
             LEFT JOIN users u1 ON t.assigner_id = u1.id
             LEFT JOIN users u2 ON t.assignee_id = u2.id
             WHERE t.user_id = ? OR t.assigner_id = ? OR t.assignee_id = ?
             ORDER BY t.create_time DESC`,
            [req.user.userId, req.user.userId, req.user.userId]
        );
        
        res.json({
            success: true,
            tasks: tasks.map(t => ({
                ...t,
                steps: JSON.parse(t.steps || '[]')
            }))
        });
    } catch (error) {
        console.error('获取任务列表错误:', error);
        res.status(500).json({ error: '获取任务列表失败' });
    }
});

// 创建任务
app.post('/api/tasks', authenticateToken, async (req, res) => {
    try {
        const {
            taskNumber, name, type, priority, startDate, deadline,
            estimatedHours, description, steps, assigneeId
        } = req.body;
        
        const [result] = await pool.query(
            `INSERT INTO tasks (
                task_number, user_id, assigner_id, assignee_id, name, type, priority,
                start_date, deadline, estimated_hours, description, steps,
                status, progress, create_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'planning', 0, ?)`,
            [
                taskNumber, req.user.userId, req.user.userId, assigneeId,
                name, type, priority, startDate, deadline, estimatedHours,
                description, JSON.stringify(steps), Date.now()
            ]
        );
        
        res.json({
            success: true,
            message: '任务创建成功',
            taskId: result.insertId
        });
    } catch (error) {
        console.error('创建任务错误:', error);
        res.status(500).json({ error: '创建任务失败' });
    }
});

// 更新任务
app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const taskId = req.params.id;
        const updates = req.body;
        
        // 构建更新SQL
        const fields = [];
        const values = [];
        
        Object.keys(updates).forEach(key => {
            if (key === 'steps') {
                fields.push(`${key} = ?`);
                values.push(JSON.stringify(updates[key]));
            } else {
                fields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        });
        
        values.push(taskId);
        
        await pool.query(
            `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        
        res.json({
            success: true,
            message: '任务更新成功'
        });
    } catch (error) {
        console.error('更新任务错误:', error);
        res.status(500).json({ error: '更新任务失败' });
    }
});

// 删除任务
app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const taskId = req.params.id;
        
        await pool.query('DELETE FROM tasks WHERE id = ?', [taskId]);
        
        res.json({
            success: true,
            message: '任务删除成功'
        });
    } catch (error) {
        console.error('删除任务错误:', error);
        res.status(500).json({ error: '删除任务失败' });
    }
});

// ==================== 周计划相关API ====================

// 获取周计划列表
app.get('/api/weekly-plans', authenticateToken, async (req, res) => {
    try {
        const { taskId } = req.query;
        
        let query = 'SELECT * FROM weekly_plans';
        let params = [];
        
        if (taskId) {
            query += ' WHERE task_id = ?';
            params.push(taskId);
        }
        
        query += ' ORDER BY week_start DESC';
        
        const [plans] = await pool.query(query, params);
        
        res.json({
            success: true,
            plans
        });
    } catch (error) {
        console.error('获取周计划错误:', error);
        res.status(500).json({ error: '获取周计划失败' });
    }
});

// 创建/更新周计划
app.post('/api/weekly-plans', authenticateToken, async (req, res) => {
    try {
        const {
            taskId, weekStart, weekEnd, content
        } = req.body;
        
        // 检查是否已存在
        const [existing] = await pool.query(
            'SELECT id, approved FROM weekly_plans WHERE task_id = ? AND week_start = ?',
            [taskId, weekStart]
        );
        
        const isAdmin = req.user.role === 'admin';
        
        if (existing.length > 0) {
            // 检查是否已审核
            if (existing[0].approved && !isAdmin) {
                return res.status(403).json({ error: '计划已审核，无法修改' });
            }
            
            // 更新
            await pool.query(
                `UPDATE weekly_plans 
                 SET content = ?, updated_by = ?, update_time = ?, submitted = ?
                 WHERE id = ?`,
                [content, req.user.studentId, Date.now(), !isAdmin, existing[0].id]
            );
        } else {
            // 创建
            await pool.query(
                `INSERT INTO weekly_plans (
                    task_id, week_start, week_end, content,
                    created_by, updated_by, create_time, update_time, submitted
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    taskId, weekStart, weekEnd, content,
                    req.user.studentId, req.user.studentId,
                    Date.now(), Date.now(), !isAdmin
                ]
            );
        }
        
        res.json({
            success: true,
            message: isAdmin ? '周计划已保存' : '周计划已提交'
        });
    } catch (error) {
        console.error('保存周计划错误:', error);
        res.status(500).json({ error: '保存周计划失败' });
    }
});

// 审核周计划
app.post('/api/weekly-plans/:id/approve', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: '权限不足' });
        }
        
        const planId = req.params.id;
        
        await pool.query(
            `UPDATE weekly_plans 
             SET approved = TRUE, approved_by = ?, approved_time = ?
             WHERE id = ?`,
            [req.user.studentId, Date.now(), planId]
        );
        
        res.json({
            success: true,
            message: '周计划已审核'
        });
    } catch (error) {
        console.error('审核周计划错误:', error);
        res.status(500).json({ error: '审核周计划失败' });
    }
});

// ==================== 启动服务器 ====================

app.listen(PORT, () => {
    console.log(`✅ 服务器运行在 http://localhost:${PORT}`);
    console.log(`📊 API文档: http://localhost:${PORT}/api`);
});

// 错误处理
process.on('unhandledRejection', (error) => {
    console.error('未处理的Promise拒绝:', error);
});


