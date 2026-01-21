// 科研任务深度管理系统 - 核心功能

class TaskSystem {
    constructor() {
        this.currentUser = null;
        this.tasks = [];
        this.currentFilter = 'all';
        this.currentTaskId = null;
        this.init();
    }

    init() {
        // 检查URL中的token参数
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (token) {
            // 通过token自动登录
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.token === token);
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUser = user;
                // 清除URL中的token参数
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                alert('无效的访问令牌！');
                window.location.href = 'neuro-simple.html';
                return;
            }
        } else {
            // 检查登录
            const userStr = localStorage.getItem('currentUser');
            if (!userStr) {
                alert('请先登录！');
                window.location.href = 'neuro-simple.html';
                return;
            }
            this.currentUser = JSON.parse(userStr);
        }
        
        // 加载数据
        this.loadData();
        
        // 设置事件
        this.setupEvents();
        
        // 初始化界面
        this.updateUI();
        
        // 应用权限控制
        this.applyPermissions();
    }

    loadData() {
        const data = localStorage.getItem('tasks_data');
        if (data) {
            this.tasks = JSON.parse(data);
        }
    }

    saveData() {
        localStorage.setItem('tasks_data', JSON.stringify(this.tasks));
    }

    setupEvents() {
        // 导航
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPage(link.dataset.page);
            });
        });

        // 过滤器
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.renderTasks();
            });
        });

        // 模态框点击外部关闭
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });
    }

    updateUI() {
        // 更新用户信息
        document.getElementById('user-name').textContent = this.currentUser.name;
        document.getElementById('welcome-name').textContent = this.currentUser.name;
        
        // 显示权限信息
        const permissions = this.currentUser.permissions || {};
        const permList = Object.entries(permissions)
            .filter(([key, value]) => value)
            .map(([key]) => this.getPermissionName(key))
            .join('、');
        
        document.getElementById('user-info').textContent = 
            `${this.currentUser.grade} · ${this.currentUser.level} · ${this.currentUser.school} | 权限: ${permList || '无'}`;
        
        // 更新统计
        this.updateStats();
        
        // 渲染工作台
        this.renderDashboard();
    }

    getPermissionName(key) {
        const names = {
            create: '创建',
            edit: '编辑',
            delete: '删除',
            view: '查看',
            analytics: '分析',
            export: '导出'
        };
        return names[key] || key;
    }

    applyPermissions() {
        const permissions = this.currentUser.permissions || {};
        
        // 如果是管理员，显示管理后台链接
        if (this.currentUser.role === 'admin') {
            const adminLink = document.getElementById('admin-link');
            if (adminLink) {
                adminLink.style.display = 'block';
            }
        }
        
        // 如果没有创建权限，隐藏创建按钮
        if (!permissions.create) {
            const createBtn = document.querySelector('.page-header .btn-primary');
            if (createBtn) {
                createBtn.style.display = 'none';
            }
        }
        
        // 如果没有分析权限，隐藏数据分析导航
        if (!permissions.analytics) {
            const analyticsLink = document.querySelector('[data-page="analytics"]');
            if (analyticsLink) {
                analyticsLink.style.display = 'none';
            }
        }
        
        // 如果没有查看权限，只能看自己的任务
        if (!permissions.view) {
            console.log('仅可查看自己的任务');
        }
    }

    hasPermission(permission) {
        const permissions = this.currentUser.permissions || {};
        return permissions[permission] === true;
    }

    updateStats() {
        // 修复：包含分配给用户的任务
        const myTasks = this.tasks.filter(t => 
            t.userId === this.currentUser.id || 
            t.assigneeId === this.currentUser.id
        );
        const inProgress = myTasks.filter(t => t.status === 'in-progress');
        const completed = myTasks.filter(t => t.status === 'completed');
        
        // 今日完成率
        const today = new Date().toDateString();
        const todayTasks = myTasks.filter(t => new Date(t.deadline).toDateString() === today);
        const todayCompleted = todayTasks.filter(t => t.status === 'completed').length;
        const todayProgress = todayTasks.length > 0 ? Math.round((todayCompleted / todayTasks.length) * 100) : 0;
        document.getElementById('today-progress').textContent = todayProgress + '%';
        
        // 本周任务
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekTasks = myTasks.filter(t => new Date(t.createTime) >= weekStart);
        document.getElementById('week-tasks').textContent = weekTasks.length;
        
        // 累计工时
        const totalHours = myTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
        document.getElementById('total-hours').textContent = totalHours.toFixed(1) + 'h';
    }

    renderDashboard() {
        // 任务概览 - 修复：包含分配给用户的任务
        const myTasks = this.tasks.filter(t => 
            t.userId === this.currentUser.id || 
            t.assigneeId === this.currentUser.id
        );
        const overview = document.getElementById('task-overview');
        overview.innerHTML = `
            <div class="stat-card">
                <div class="stat-row">
                    <span>规划中</span>
                    <strong>${myTasks.filter(t => t.status === 'planning').length}</strong>
                </div>
                <div class="stat-row">
                    <span>进行中</span>
                    <strong>${myTasks.filter(t => t.status === 'in-progress').length}</strong>
                </div>
                <div class="stat-row">
                    <span>待审核</span>
                    <strong>${myTasks.filter(t => t.status === 'review').length}</strong>
                </div>
                <div class="stat-row">
                    <span>已完成</span>
                    <strong>${myTasks.filter(t => t.status === 'completed').length}</strong>
                </div>
            </div>
        `;
        
        // 今日待办
        const today = new Date().toDateString();
        const todayTasks = myTasks.filter(t => 
            new Date(t.deadline).toDateString() === today && t.status !== 'completed'
        );
        const todayContainer = document.getElementById('today-tasks');
        if (todayTasks.length === 0) {
            todayContainer.innerHTML = '<div class="empty-state"><div class="empty-icon">✅</div><p>今日无待办任务</p></div>';
        } else {
            todayContainer.innerHTML = todayTasks.map(t => `
                <div class="task-card" onclick="app.showTaskDetail(${t.id})">
                    <div class="task-title">${this.escapeHtml(t.name)}</div>
                    <div class="task-meta">
                        <span>${t.type}</span>
                        <span>进度: ${t.progress || 0}%</span>
                    </div>
                </div>
            `).join('');
        }
        
        // 进度趋势
        const chart = document.getElementById('progress-chart');
        const last7Days = this.getLast7DaysProgress();
        chart.innerHTML = `
            <div class="stat-card">
                ${last7Days.map(day => `
                    <div class="stat-row">
                        <span>${day.date}</span>
                        <strong>${day.completed}个任务</strong>
                    </div>
                `).join('')}
            </div>
        `;
        
        // 本周目标
        const goals = document.getElementById('week-goals');
        const weekTasks = myTasks.filter(t => {
            const deadline = new Date(t.deadline);
            const weekEnd = new Date();
            weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()));
            return deadline <= weekEnd && t.status !== 'completed';
        });
        if (weekTasks.length === 0) {
            goals.innerHTML = '<div class="empty-state"><div class="empty-icon">🎯</div><p>本周无目标任务</p></div>';
        } else {
            goals.innerHTML = weekTasks.slice(0, 5).map(t => `
                <div class="task-card" onclick="app.showTaskDetail(${t.id})">
                    <div class="task-title">${this.escapeHtml(t.name)}</div>
                    <div class="task-meta">
                        <span>截止: ${t.deadline}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    getLast7DaysProgress() {
        const result = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
            const completed = this.tasks.filter(t => 
                (t.userId === this.currentUser.id || t.assigneeId === this.currentUser.id) &&
                t.status === 'completed' &&
                new Date(t.completeTime).toDateString() === date.toDateString()
            ).length;
            result.push({ date: dateStr, completed });
        }
        return result;
    }

    showPage(pageName) {
        // 更新导航
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === pageName) {
                link.classList.add('active');
            }
        });
        
        // 显示页面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageName + '-page').classList.add('active');
        
        // 渲染内容
        if (pageName === 'tasks') {
            this.renderTasks();
        } else if (pageName === 'analytics') {
            this.renderAnalytics();
        } else if (pageName === 'profile') {
            this.renderProfile();
        }
    }

    showTaskModal() {
        if (!this.hasPermission('create')) {
            this.showToast('您没有创建任务的权限！', 'error');
            return;
        }
        
        document.getElementById('task-form').reset();
        document.getElementById('modal-title').textContent = '创建科研任务';
        
        // 设置默认日期
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('task-start').value = today;
        
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 7);
        document.getElementById('task-deadline').value = deadline.toISOString().split('T')[0];
        
        document.getElementById('task-modal').classList.add('show');
    }

    saveTask(event) {
        event.preventDefault();
        
        const task = {
            id: Date.now(),
            userId: this.currentUser.id,
            name: document.getElementById('task-name').value,
            type: document.getElementById('task-type').value,
            priority: document.getElementById('task-priority').value,
            startDate: document.getElementById('task-start').value,
            deadline: document.getElementById('task-deadline').value,
            estimatedHours: parseFloat(document.getElementById('task-hours').value) || 0,
            description: document.getElementById('task-desc').value,
            steps: document.getElementById('task-steps').value.split('\n').filter(s => s.trim()),
            status: 'planning',
            progress: 0,
            actualHours: 0,
            progressHistory: [],
            createTime: Date.now()
        };
        
        this.tasks.unshift(task);
        this.saveData();
        this.closeModal('task-modal');
        this.showToast('任务创建成功！', 'success');
        this.updateUI();
        this.renderTasks();
    }

    renderTasks() {
        const container = document.getElementById('tasks-container');
        // 修复：显示用户创建的任务 OR 分配给用户的任务
        let myTasks = this.tasks.filter(t => 
            t.userId === this.currentUser.id || 
            t.assigneeId === this.currentUser.id
        );
        
        // 应用过滤
        if (this.currentFilter !== 'all') {
            myTasks = myTasks.filter(t => t.status === this.currentFilter);
        }
        
        if (myTasks.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>暂无任务</p></div>';
            return;
        }
        
        container.innerHTML = myTasks.map(task => this.renderTaskCard(task)).join('');
    }

    renderTaskCard(task) {
        const statusMap = {
            'planning': { text: '规划中', class: 'badge-planning' },
            'in-progress': { text: '进行中', class: 'badge-in-progress' },
            'review': { text: '待审核', class: 'badge-review' },
            'completed': { text: '已完成', class: 'badge-completed' }
        };
        
        const status = statusMap[task.status];
        const priorityIcon = task.priority === '高' ? '🔴' : task.priority === '中' ? '🟡' : '🟢';
        
        // 根据权限显示操作按钮
        let actionButtons = '';
        if (task.status !== 'completed') {
            if (this.hasPermission('edit')) {
                actionButtons += `<button class="btn btn-primary btn-sm" onclick="app.showProgressModal(${task.id})">更新进度</button>`;
            }
            if (this.hasPermission('edit') && task.status === 'planning') {
                actionButtons += `<button class="btn btn-secondary btn-sm" onclick="app.changeTaskStatus(${task.id}, 'in-progress')">开始任务</button>`;
            }
        }
        if (task.status === 'in-progress' && this.hasPermission('edit')) {
            actionButtons += `<button class="btn btn-success btn-sm" onclick="app.changeTaskStatus(${task.id}, 'completed')">完成任务</button>`;
        }
        if (this.hasPermission('delete')) {
            actionButtons += `<button class="btn btn-secondary btn-sm" onclick="app.deleteTask(${task.id})" style="background: #ef4444; color: white;">删除</button>`;
        }
        
        return `
            <div class="task-card" onclick="app.showTaskDetail(${task.id})">
                <div class="task-title">${this.escapeHtml(task.name)}</div>
                <div class="task-meta">
                    <span class="task-badge ${status.class}">${status.text}</span>
                    <span>${priorityIcon} ${task.priority}优先级</span>
                    <span>📅 ${task.deadline}</span>
                    <span>⏱️ ${task.actualHours}/${task.estimatedHours}h</span>
                </div>
                <div class="task-progress">
                    <div class="progress-header">
                        <span>任务进度</span>
                        <span>${task.progress || 0}%</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${task.progress || 0}%"></div>
                    </div>
                </div>
                ${actionButtons ? `
                    <div class="task-actions" onclick="event.stopPropagation()">
                        ${actionButtons}
                    </div>
                ` : ''}
            </div>
        `;
    }

    showTaskDetail(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const content = document.getElementById('task-detail-content');
        content.innerHTML = `
            <div style="padding: 24px;">
                <h2>${this.escapeHtml(task.name)}</h2>
                <div style="margin: 20px 0;">
                    <p><strong>类型：</strong>${task.type}</p>
                    <p><strong>优先级：</strong>${task.priority}</p>
                    <p><strong>开始日期：</strong>${task.startDate}</p>
                    <p><strong>截止日期：</strong>${task.deadline}</p>
                    <p><strong>预计工时：</strong>${task.estimatedHours}小时</p>
                    <p><strong>实际工时：</strong>${task.actualHours}小时</p>
                </div>
                ${task.description ? `<div><strong>任务描述：</strong><p>${this.escapeHtml(task.description)}</p></div>` : ''}
                ${task.steps && task.steps.length > 0 ? `
                    <div style="margin-top: 20px;">
                        <strong>关键步骤：</strong>
                        <ul style="margin-top: 10px; padding-left: 20px;">
                            ${task.steps.map(step => `<li>${this.escapeHtml(step)}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                ${task.progressHistory && task.progressHistory.length > 0 ? `
                    <div style="margin-top: 20px;">
                        <strong>进度历史：</strong>
                        ${task.progressHistory.map(h => `
                            <div style="margin: 10px 0; padding: 10px; background: #f8fafc; border-radius: 8px;">
                                <p><strong>${new Date(h.time).toLocaleString()}</strong> - 进度: ${h.progress}%</p>
                                ${h.work ? `<p>工作内容: ${this.escapeHtml(h.work)}</p>` : ''}
                                ${h.issues ? `<p>遇到问题: ${this.escapeHtml(h.issues)}</p>` : ''}
                                ${h.hours ? `<p>工时: ${h.hours}小时</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        document.getElementById('task-detail-modal').classList.add('show');
    }

    showProgressModal(taskId) {
        this.currentTaskId = taskId;
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        document.getElementById('progress-form').reset();
        document.getElementById('progress-value').value = task.progress || 0;
        document.getElementById('progress-percent').textContent = (task.progress || 0) + '%';
        
        document.getElementById('progress-modal').classList.add('show');
    }

    updateProgressDisplay(value) {
        document.getElementById('progress-percent').textContent = value + '%';
    }

    updateProgress(event) {
        event.preventDefault();
        
        const task = this.tasks.find(t => t.id === this.currentTaskId);
        if (!task) return;
        
        const progress = parseInt(document.getElementById('progress-value').value);
        const work = document.getElementById('progress-work').value;
        const issues = document.getElementById('progress-issues').value;
        const hours = parseFloat(document.getElementById('progress-hours').value) || 0;
        
        // 更新任务
        task.progress = progress;
        task.actualHours += hours;
        
        // 添加历史记录
        if (!task.progressHistory) task.progressHistory = [];
        task.progressHistory.push({
            time: Date.now(),
            progress,
            work,
            issues,
            hours
        });
        
        // 如果进度100%，自动改为待审核
        if (progress === 100 && task.status === 'in-progress') {
            task.status = 'review';
        }
        
        this.saveData();
        this.closeModal('progress-modal');
        this.showToast('进度更新成功！', 'success');
        this.updateUI();
        this.renderTasks();
    }

    changeTaskStatus(taskId, newStatus) {
        if (!this.hasPermission('edit')) {
            this.showToast('您没有编辑任务的权限！', 'error');
            return;
        }
        
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        task.status = newStatus;
        if (newStatus === 'completed') {
            task.progress = 100;
            task.completeTime = Date.now();
        } else if (newStatus === 'in-progress' && task.status === 'planning') {
            task.startTime = Date.now();
        }
        
        this.saveData();
        this.showToast('状态更新成功！', 'success');
        this.updateUI();
        this.renderTasks();
    }

    deleteTask(taskId) {
        if (!this.hasPermission('delete')) {
            this.showToast('您没有删除任务的权限！', 'error');
            return;
        }
        
        if (confirm('确定要删除这个任务吗？此操作不可恢复！')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveData();
            this.showToast('任务已删除！', 'success');
            this.updateUI();
            this.renderTasks();
        }
    }

    renderAnalytics() {
        // 修复：包含分配给用户的任务
        const myTasks = this.tasks.filter(t => 
            t.userId === this.currentUser.id || 
            t.assigneeId === this.currentUser.id
        );
        
        // 完成统计
        const stats = document.getElementById('completion-stats');
        const total = myTasks.length;
        const completed = myTasks.filter(t => t.status === 'completed').length;
        const rate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;
        
        stats.innerHTML = `
            <div class="stat-card">
                <div class="stat-row">
                    <span>总任务数</span>
                    <strong>${total}</strong>
                </div>
                <div class="stat-row">
                    <span>已完成</span>
                    <strong>${completed}</strong>
                </div>
                <div class="stat-row">
                    <span>完成率</span>
                    <strong>${rate}%</strong>
                </div>
            </div>
        `;
        
        // 时间分布
        const timeDistribution = document.getElementById('time-distribution');
        const typeStats = {};
        myTasks.forEach(t => {
            if (!typeStats[t.type]) typeStats[t.type] = 0;
            typeStats[t.type] += t.actualHours || 0;
        });
        
        timeDistribution.innerHTML = `
            <div class="stat-card">
                ${Object.entries(typeStats).map(([type, hours]) => `
                    <div class="stat-row">
                        <span>${type}</span>
                        <strong>${hours.toFixed(1)}h</strong>
                    </div>
                `).join('')}
            </div>
        `;
        
        // 效率分析
        const efficiency = document.getElementById('efficiency-analysis');
        const avgProgress = myTasks.length > 0 ? 
            (myTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / myTasks.length).toFixed(1) : 0;
        const onTime = myTasks.filter(t => 
            t.status === 'completed' && 
            new Date(t.completeTime) <= new Date(t.deadline)
        ).length;
        const onTimeRate = completed > 0 ? ((onTime / completed) * 100).toFixed(1) : 0;
        
        efficiency.innerHTML = `
            <div class="stat-card">
                <div class="stat-row">
                    <span>平均进度</span>
                    <strong>${avgProgress}%</strong>
                </div>
                <div class="stat-row">
                    <span>按时完成</span>
                    <strong>${onTime}/${completed}</strong>
                </div>
                <div class="stat-row">
                    <span>按时率</span>
                    <strong>${onTimeRate}%</strong>
                </div>
            </div>
        `;
        
        // 成长曲线
        const growth = document.getElementById('growth-curve');
        const monthlyData = this.getMonthlyCompletion();
        growth.innerHTML = `
            <div class="stat-card">
                ${monthlyData.map(m => `
                    <div class="stat-row">
                        <span>${m.month}</span>
                        <strong>${m.count}个任务</strong>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getMonthlyCompletion() {
        const result = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStr = date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' });
            const count = this.tasks.filter(t => 
                (t.userId === this.currentUser.id || t.assigneeId === this.currentUser.id) &&
                t.status === 'completed' &&
                new Date(t.completeTime).getMonth() === date.getMonth() &&
                new Date(t.completeTime).getFullYear() === date.getFullYear()
            ).length;
            result.push({ month: monthStr, count });
        }
        return result;
    }

    renderProfile() {
        // 基本信息
        const basic = document.getElementById('profile-basic');
        const permissions = this.currentUser.permissions || {};
        const permList = Object.entries(permissions)
            .map(([key, value]) => `${this.getPermissionName(key)}: ${value ? '✅' : '❌'}`)
            .join('<br>');
        
        // 生成直接登录链接
        const baseUrl = window.location.origin + window.location.pathname;
        const directUrl = `${baseUrl}?token=${this.currentUser.token}`;
        
        basic.innerHTML = `
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">学号</div>
                    <div class="info-value">${this.currentUser.studentId}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">姓名</div>
                    <div class="info-value">${this.currentUser.name}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">年级</div>
                    <div class="info-value">${this.currentUser.grade}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">学校</div>
                    <div class="info-value">${this.currentUser.school}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">培养层次</div>
                    <div class="info-value">${this.currentUser.level}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">联系电话</div>
                    <div class="info-value">${this.currentUser.phone}</div>
                </div>
            </div>
            <div style="margin-top: 24px; padding: 16px; background: #f8fafc; border-radius: 10px;">
                <h4 style="font-size: 14px; margin-bottom: 12px; color: #667eea;">🔐 我的权限</h4>
                <div style="font-size: 13px; line-height: 1.8;">${permList}</div>
            </div>
            <div style="margin-top: 16px; padding: 16px; background: #e0e7ff; border-radius: 10px;">
                <h4 style="font-size: 14px; margin-bottom: 8px; color: #667eea;">🔗 直接登录链接</h4>
                <p style="font-size: 12px; color: #64748b; margin-bottom: 8px;">复制此链接可直接登录系统，无需输入密码</p>
                <input type="text" value="${directUrl}" readonly 
                    style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; font-family: monospace;"
                    onclick="this.select(); document.execCommand('copy'); app.showToast('链接已复制！', 'success');">
            </div>
        `;
        
        // 成就系统 - 修复：包含分配给用户的任务
        const achievements = document.getElementById('achievements');
        const myTasks = this.tasks.filter(t => 
            t.userId === this.currentUser.id || 
            t.assigneeId === this.currentUser.id
        );
        const completed = myTasks.filter(t => t.status === 'completed').length;
        const totalHours = myTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
        
        const achievementList = [
            { icon: '🎯', name: '初出茅庐', desc: '完成首个任务', unlocked: completed >= 1 },
            { icon: '🏆', name: '勤奋学者', desc: '完成10个任务', unlocked: completed >= 10 },
            { icon: '⭐', name: '科研达人', desc: '完成50个任务', unlocked: completed >= 50 },
            { icon: '⏰', name: '时间管理', desc: '累计100小时', unlocked: totalHours >= 100 },
            { icon: '📚', name: '知识渊博', desc: '累计500小时', unlocked: totalHours >= 500 },
            { icon: '👑', name: '科研之星', desc: '完成100个任务', unlocked: completed >= 100 }
        ];
        
        achievements.innerHTML = `
            <div class="achievement-grid">
                ${achievementList.map(a => `
                    <div class="achievement-item ${a.unlocked ? '' : 'achievement-locked'}">
                        <div class="achievement-icon">${a.icon}</div>
                        <div class="achievement-name">${a.name}</div>
                        <div class="achievement-desc">${a.desc}</div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // 能力雷达（使用上面已经修复的myTasks）
        const radar = document.getElementById('ability-radar');
        const typeCount = {};
        myTasks.forEach(t => {
            if (!typeCount[t.type]) typeCount[t.type] = 0;
            typeCount[t.type]++;
        });
        
        radar.innerHTML = `
            <div class="stat-card">
                ${Object.entries(typeCount).map(([type, count]) => `
                    <div class="stat-row">
                        <span>${type}</span>
                        <strong>${count}个任务</strong>
                    </div>
                `).join('')}
                ${Object.keys(typeCount).length === 0 ? '<p style="text-align:center;color:#64748b;">暂无数据</p>' : ''}
            </div>
        `;
        
        // 活动日历
        const calendar = document.getElementById('activity-calendar');
        const recentActivity = myTasks
            .filter(t => t.completeTime)
            .sort((a, b) => b.completeTime - a.completeTime)
            .slice(0, 10);
        
        calendar.innerHTML = `
            <div class="stat-card">
                ${recentActivity.map(t => `
                    <div class="stat-row">
                        <span>${new Date(t.completeTime).toLocaleDateString()}</span>
                        <span>${this.escapeHtml(t.name)}</span>
                    </div>
                `).join('')}
                ${recentActivity.length === 0 ? '<p style="text-align:center;color:#64748b;">暂无活动记录</p>' : ''}
            </div>
        `;
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = 'toast show ' + type;
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    logout() {
        if (confirm('确定要退出登录吗？')) {
            localStorage.removeItem('currentUser');
            window.location.href = 'neuro-simple.html';
        }
    }
}

// 初始化应用
const app = new TaskSystem();

