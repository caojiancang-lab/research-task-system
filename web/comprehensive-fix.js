// 综合修复和增强脚本
// 实现所有新需求

(function() {
    // ==================== 1. 实时反馈通知系统 ====================
    
    // 检查新反馈
    TaskSystem.prototype.checkNewFeedbacks = function() {
        const tasks = this.tasks.filter(t => 
            t.assignerId === this.currentUser.id || 
            t.assigneeId === this.currentUser.id
        );
        
        let unreadCount = 0;
        tasks.forEach(task => {
            if (task.feedbacks && task.feedbacks.length > 0) {
                task.feedbacks.forEach(feedback => {
                    // 如果是指派人，检查接收人的反馈
                    if (this.currentUser.id === task.assignerId && 
                        feedback.userId === task.assigneeId && 
                        !feedback.readByAssigner) {
                        unreadCount++;
                    }
                    // 如果是接收人，检查指派人的回复
                    if (this.currentUser.id === task.assigneeId && 
                        feedback.reply && 
                        !feedback.readByAssignee) {
                        unreadCount++;
                    }
                });
            }
        });
        
        return unreadCount;
    };
    
    // 显示通知徽章
    TaskSystem.prototype.updateNotificationBadge = function() {
        const count = this.checkNewFeedbacks();
        const tasksLink = document.querySelector('[data-page="tasks"]');
        
        if (tasksLink) {
            let badge = tasksLink.querySelector('.notification-badge');
            if (count > 0) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'notification-badge';
                    tasksLink.style.position = 'relative';
                    tasksLink.appendChild(badge);
                }
                badge.textContent = count > 99 ? '99+' : count;
            } else if (badge) {
                badge.remove();
            }
        }
    };
    
    // 标记反馈为已读
    TaskSystem.prototype.markFeedbackAsRead = function(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task || !task.feedbacks) return;
        
        task.feedbacks.forEach(feedback => {
            if (this.currentUser.id === task.assignerId && feedback.userId === task.assigneeId) {
                feedback.readByAssigner = true;
            }
            if (this.currentUser.id === task.assigneeId && feedback.reply) {
                feedback.readByAssignee = true;
            }
        });
        
        this.saveData();
        this.updateNotificationBadge();
    };
    
    // 增强任务详情显示，添加未读标记
    const originalShowTaskDetail = TaskSystem.prototype.showTaskDetail;
    TaskSystem.prototype.showTaskDetail = function(taskId) {
        this.markFeedbackAsRead(taskId);
        if (originalShowTaskDetail) {
            originalShowTaskDetail.call(this, taskId);
        }
    };
    
    // ==================== 2. 修改进度权限控制 ====================
    
    // 只有指派人可以修改进度
    const originalShowProgressModal = TaskSystem.prototype.showProgressModal;
    TaskSystem.prototype.showProgressModal = function(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // 只有指派人可以修改进度
        if (task.assignerId !== this.currentUser.id) {
            this.showToast('只有任务指派人可以修改进度！', 'error');
            return;
        }
        
        if (originalShowProgressModal) {
            originalShowProgressModal.call(this, taskId);
        }
    };
    
    // ==================== 3. 任务编号自动回收 ====================
    
    // 获取可用的任务编号
    TaskSystem.prototype.getAvailableTaskNumber = function() {
        const existingNumbers = this.tasks
            .map(t => t.taskNumber)
            .filter(n => n && n.startsWith('任务'))
            .map(n => parseInt(n.replace('任务', '')))
            .filter(n => !isNaN(n))
            .sort((a, b) => a - b);
        
        // 找到第一个缺失的编号
        for (let i = 1; i <= existingNumbers.length + 1; i++) {
            if (!existingNumbers.includes(i)) {
                return `任务${String(i).padStart(3, '0')}`;
            }
        }
        
        return `任务${String(existingNumbers.length + 1).padStart(3, '0')}`;
    };
    
    // 重写任务编号生成
    const originalShowTaskModal = TaskSystem.prototype.showTaskModal;
    TaskSystem.prototype.showTaskModal = function() {
        if (originalShowTaskModal) {
            originalShowTaskModal.call(this);
        }
        
        // 使用可用编号
        const taskNumberEl = document.getElementById('task-number');
        if (taskNumberEl) {
            taskNumberEl.value = this.getAvailableTaskNumber();
        }
    };
    
    // ==================== 4. 人员任务查看模块 ====================
    
    // 添加人员任务查看页面
    TaskSystem.prototype.showUserTasksView = function() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const container = document.getElementById('tasks-container');
        
        container.innerHTML = `
            <div class="user-filter-section">
                <h3 style="margin-bottom: 16px; font-size: 18px; font-weight: 600;">👥 人员任务查看</h3>
                <div class="user-filter-grid">
                    <div class="form-group" style="margin: 0;">
                        <label>选择人员</label>
                        <select id="user-task-filter" onchange="app.filterUserTasks()" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px;">
                            <option value="all">全部人员</option>
                            ${users.map(u => `<option value="${u.id}">${u.name} (${u.studentId})</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label>任务状态</label>
                        <select id="user-task-status-filter" onchange="app.filterUserTasks()" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px;">
                            <option value="all">全部状态</option>
                            <option value="planning">规划中</option>
                            <option value="in-progress">进行中</option>
                            <option value="review">待审核</option>
                            <option value="completed">已完成</option>
                        </select>
                    </div>
                    <button class="btn btn-secondary" onclick="app.showMyTasks()" style="height: fit-content;">返回我的任务</button>
                </div>
            </div>
            <div id="user-tasks-list"></div>
        `;
        
        this.filterUserTasks();
    };
    
    // 筛选用户任务
    TaskSystem.prototype.filterUserTasks = function() {
        const userFilter = document.getElementById('user-task-filter');
        const statusFilter = document.getElementById('user-task-status-filter');
        const listContainer = document.getElementById('user-tasks-list');
        
        if (!userFilter || !statusFilter || !listContainer) return;
        
        const selectedUserId = userFilter.value;
        const selectedStatus = statusFilter.value;
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        let filteredTasks = this.tasks;
        
        // 按人员筛选
        if (selectedUserId !== 'all') {
            filteredTasks = filteredTasks.filter(t => 
                t.assigneeId == selectedUserId || t.userId == selectedUserId
            );
        }
        
        // 按状态筛选
        if (selectedStatus !== 'all') {
            filteredTasks = filteredTasks.filter(t => t.status === selectedStatus);
        }
        
        if (filteredTasks.length === 0) {
            listContainer.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>暂无任务</p></div>';
            return;
        }
        
        // 按人员分组
        const tasksByUser = {};
        filteredTasks.forEach(task => {
            const userId = task.assigneeId || task.userId;
            if (!tasksByUser[userId]) {
                tasksByUser[userId] = [];
            }
            tasksByUser[userId].push(task);
        });
        
        listContainer.innerHTML = Object.entries(tasksByUser).map(([userId, tasks]) => {
            const user = users.find(u => u.id == userId);
            const userName = user ? user.name : '未知用户';
            const userStudentId = user ? user.studentId : '';
            
            const completed = tasks.filter(t => t.status === 'completed').length;
            const total = tasks.length;
            const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
            
            return `
                <div class="user-task-card">
                    <div class="user-task-header">
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <div class="user-task-avatar">${userName.charAt(0)}</div>
                            <div>
                                <h3 style="margin: 0; font-size: 20px;">${userName}</h3>
                                <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">学号: ${userStudentId}</p>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 24px; font-weight: 700; color: #667eea;">${completed}/${total}</div>
                            <div style="font-size: 13px; color: #64748b;">完成率: ${rate}%</div>
                        </div>
                    </div>
                    
                    <div style="display: grid; gap: 12px;">
                        ${tasks.map(task => {
                            const statusMap = {
                                'planning': { text: '规划中', class: 'badge-planning' },
                                'in-progress': { text: '进行中', class: 'badge-in-progress' },
                                'review': { text: '待审核', class: 'badge-review' },
                                'completed': { text: '已完成', class: 'badge-completed' }
                            };
                            const status = statusMap[task.status];
                            
                            return `
                                <div style="padding: 16px; background: #f8fafc; border-radius: 12px; cursor: pointer; transition: all 0.3s;" 
                                     onclick="app.showTaskDetail(${task.id})"
                                     onmouseover="this.style.background='#e0e7ff'"
                                     onmouseout="this.style.background='#f8fafc'">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                        <strong style="font-size: 16px;">${this.escapeHtml(task.name)}</strong>
                                        <span class="task-badge ${status.class}">${status.text}</span>
                                    </div>
                                    <div style="display: flex; gap: 16px; font-size: 13px; color: #64748b;">
                                        <span>📅 ${task.deadline}</span>
                                        <span>📊 进度: ${task.progress || 0}%</span>
                                        <span>⏱️ ${task.actualHours}/${task.estimatedHours}h</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    };
    
    // 返回我的任务
    TaskSystem.prototype.showMyTasks = function() {
        this.renderTasks();
    };
    
    // 在任务过滤器中添加"人员任务"按钮
    const originalShowPage = TaskSystem.prototype.showPage;
    TaskSystem.prototype.showPage = function(pageName) {
        if (originalShowPage) {
            originalShowPage.call(this, pageName);
        }
        
        if (pageName === 'tasks') {
            // 添加人员任务查看按钮
            const filtersDiv = document.querySelector('.task-filters');
            if (filtersDiv && !document.getElementById('user-tasks-btn')) {
                const btn = document.createElement('button');
                btn.id = 'user-tasks-btn';
                btn.className = 'filter-btn';
                btn.textContent = '👥 人员任务';
                btn.onclick = () => this.showUserTasksView();
                filtersDiv.appendChild(btn);
            }
        }
    };
    
    // ==================== 5. 定期检查通知 ====================
    
    // 每30秒检查一次新反馈
    setInterval(() => {
        if (app && app.updateNotificationBadge) {
            app.updateNotificationBadge();
        }
    }, 30000);
    
    // 初始化时检查
    if (app && app.updateNotificationBadge) {
        app.updateNotificationBadge();
    }
    
    console.log('✅ 综合修复脚本已加载');
})();


