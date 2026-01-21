// 系统增强功能补充脚本
// 在 advanced-app.js 之后加载

// 扩展 TaskSystem 类
(function() {
    const originalInit = TaskSystem.prototype.init;
    
    // 保存原始方法的引用
    const originalShowPage = TaskSystem.prototype.showPage;
    const originalShowTaskModal = TaskSystem.prototype.showTaskModal;
    const originalSaveTask = TaskSystem.prototype.saveTask;
    const originalRenderTaskCard = TaskSystem.prototype.renderTaskCard;
    const originalRenderAnalytics = TaskSystem.prototype.renderAnalytics;
    
    // 添加新属性
    TaskSystem.prototype.currentEditUserId = null;
    
    // 增强 showTaskModal
    TaskSystem.prototype.showTaskModal = function() {
        if (!this.hasPermission('create')) {
            this.showToast('您没有创建任务的权限！', 'error');
            return;
        }
        
        document.getElementById('task-form').reset();
        document.getElementById('modal-title').textContent = '创建科研任务';
        
        // 生成任务编号
        const taskCount = this.tasks.length + 1;
        const taskNumber = `任务${String(taskCount).padStart(3, '0')}`;
        if (document.getElementById('task-number')) {
            document.getElementById('task-number').value = taskNumber;
        }
        
        // 设置指派人
        if (document.getElementById('task-assigner')) {
            document.getElementById('task-assigner').value = this.currentUser.name;
        }
        
        // 加载接收人列表
        this.loadAssigneeList();
        
        // 设置默认日期
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('task-start').value = today;
        if (document.getElementById('task-accept-date')) {
            document.getElementById('task-accept-date').value = today;
        }
        
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 7);
        document.getElementById('task-deadline').value = deadline.toISOString().split('T')[0];
        
        document.getElementById('task-modal').classList.add('show');
    };
    
    // 加载接收人列表
    TaskSystem.prototype.loadAssigneeList = function() {
        const assigneeSelect = document.getElementById('task-assignee');
        if (!assigneeSelect) return;
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        assigneeSelect.innerHTML = '<option value="">请选择接收人</option>';
        
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.name} (${user.studentId})`;
            if (user.id === this.currentUser.id) {
                option.selected = true;
            }
            assigneeSelect.appendChild(option);
        });
    };
    
    // 增强 saveTask
    TaskSystem.prototype.saveTask = function(event) {
        event.preventDefault();
        
        const assigneeSelect = document.getElementById('task-assignee');
        const assigneeId = assigneeSelect ? assigneeSelect.value : this.currentUser.id;
        
        if (assigneeSelect && !assigneeId) {
            this.showToast('请选择接收人！', 'error');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const assignee = users.find(u => u.id == assigneeId) || this.currentUser;
        
        const taskNumberEl = document.getElementById('task-number');
        const taskNumber = taskNumberEl ? taskNumberEl.value : `任务${String(this.tasks.length + 1).padStart(3, '0')}`;
        
        const acceptDateEl = document.getElementById('task-accept-date');
        const acceptDate = acceptDateEl ? acceptDateEl.value : new Date().toISOString().split('T')[0];
        
        const task = {
            id: Date.now(),
            taskNumber: taskNumber,
            userId: this.currentUser.id,
            assignerId: this.currentUser.id,
            assignerName: this.currentUser.name,
            assigneeId: parseInt(assigneeId) || this.currentUser.id,
            assigneeName: assignee.name,
            acceptDate: acceptDate,
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
    };
    
    // 增强 renderTaskCard
    TaskSystem.prototype.renderTaskCard = function(task) {
        const statusInfo = this.getStatusInfo ? this.getStatusInfo(task.status) : {
            text: task.status,
            class: 'badge-planning',
            color: '#667eea'
        };
        
        const priorityIcon = task.priority === '高' ? '🔴' : task.priority === '中' ? '🟡' : '🟢';
        
        // 分析风险
        const risks = this.analyzeTaskRisks ? this.analyzeTaskRisks(task) : [];
        const hasHighRisk = risks.some(r => r.level === 'high');
        
        // 子任务进度
        let subtaskInfo = '';
        if (task.subtasks && task.subtasks.length > 0) {
            const completed = task.subtasks.filter(s => s.completed).length;
            const total = task.subtasks.length;
            subtaskInfo = `<span>📋 子任务: ${completed}/${total}</span>`;
        }
        
        let actionButtons = '';
        if (task.status !== 'completed' && task.status !== 'cancelled') {
            if (this.hasPermission('edit')) {
                actionButtons += `<button class="btn btn-primary btn-sm" onclick="app.showProgressModal(${task.id})">更新进度</button>`;
            }
            actionButtons += `<button class="btn btn-secondary btn-sm" onclick="app.showStatusChangeModal(${task.id})">变更状态</button>`;
        }
        if (this.hasPermission('delete')) {
            actionButtons += `<button class="btn btn-secondary btn-sm" onclick="app.deleteTask(${task.id})" style="background: #ef4444; color: white;">删除</button>`;
        }
        
        return `
            <div class="task-card" onclick="app.showTaskDetail(${task.id})">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 12px; color: #667eea; font-weight: 600;">${task.taskNumber || '未编号'}</span>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        ${hasHighRisk ? '<span style="font-size: 20px;" title="存在高风险">⚠️</span>' : ''}
                        <span class="task-badge ${statusInfo.class}">${statusInfo.text}</span>
                    </div>
                </div>
                <div class="task-title">${this.escapeHtml(task.name)}</div>
                <div class="task-meta">
                    <span>👤 指派：${task.assignerName || '未知'}</span>
                    <span>📥 接收：${task.assigneeName || '未知'}</span>
                    <span>${priorityIcon} ${task.priority}优先级</span>
                    <span>📅 ${task.deadline}</span>
                    <span>⏱️ ${task.actualHours}/${task.estimatedHours}h</span>
                    ${subtaskInfo}
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
    };
    
    // 增强 showPage
    TaskSystem.prototype.showPage = function(pageName) {
        if (originalShowPage) {
            originalShowPage.call(this, pageName);
        }
        
        if (pageName === 'admin') {
            this.showAdminPage();
        }
    };
    
    // 管理后台相关方法
    TaskSystem.prototype.showAdminPage = function() {
        this.renderAdminUsers();
        this.updateAdminStats();
    };
    
    TaskSystem.prototype.renderAdminUsers = function() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const container = document.getElementById('admin-users-list');
        if (!container) return;
        
        if (users.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-icon">👥</div><p>暂无用户</p></div>';
            return;
        }
        
        container.innerHTML = users.map(user => {
            const permissions = user.permissions || {};
            const permCount = Object.values(permissions).filter(v => v).length;
            
            return `
                <div class="task-card" style="cursor: default;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
                                ${this.escapeHtml(user.name)} 
                                <span style="color: #64748b; font-size: 14px; font-weight: 400;">(${user.studentId})</span>
                            </div>
                            <div style="font-size: 13px; color: #64748b;">
                                ${user.role === 'admin' ? '👑 管理员' : '👤 用户'} · 
                                ${user.grade} · 
                                权限: ${permCount}/6
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-secondary btn-sm" onclick="app.editUser(${user.id})">编辑</button>
                            <button class="btn btn-secondary btn-sm" onclick="app.viewUserLink(${user.id})">链接</button>
                            ${user.id !== this.currentUser.id ? 
                                `<button class="btn btn-secondary btn-sm" onclick="app.deleteUser(${user.id})" style="background:#ef4444;color:white;">删除</button>` 
                                : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    };
    
    TaskSystem.prototype.updateAdminStats = function() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const allTasks = this.tasks;
        
        const totalUsersEl = document.getElementById('admin-total-users');
        const totalTasksEl = document.getElementById('admin-total-tasks');
        const activeUsersEl = document.getElementById('admin-active-users');
        const completionRateEl = document.getElementById('admin-completion-rate');
        
        if (totalUsersEl) totalUsersEl.textContent = users.length;
        if (totalTasksEl) totalTasksEl.textContent = allTasks.length;
        if (activeUsersEl) activeUsersEl.textContent = users.length;
        
        if (completionRateEl) {
            const completed = allTasks.filter(t => t.status === 'completed').length;
            const rate = allTasks.length > 0 ? Math.round((completed / allTasks.length) * 100) : 0;
            completionRateEl.textContent = rate + '%';
        }
    };
    
    TaskSystem.prototype.showAddUserModal = function() {
        this.currentEditUserId = null;
        const titleEl = document.getElementById('user-modal-title');
        if (titleEl) titleEl.textContent = '添加用户';
        
        const formEl = document.getElementById('user-form');
        if (formEl) formEl.reset();
        
        const roleEl = document.getElementById('user-role');
        if (roleEl) roleEl.value = 'user';
        
        this.updateUserRolePermissions();
        
        const modalEl = document.getElementById('user-modal');
        if (modalEl) modalEl.classList.add('show');
    };
    
    TaskSystem.prototype.updateUserRolePermissions = function() {
        const roleEl = document.getElementById('user-role');
        if (!roleEl) return;
        
        const role = roleEl.value;
        const isAdmin = role === 'admin';
        
        const perms = ['create', 'edit', 'delete', 'view', 'analytics', 'export'];
        perms.forEach(perm => {
            const el = document.getElementById(`user-perm-${perm}`);
            if (el) {
                if (isAdmin) {
                    el.checked = true;
                } else {
                    el.checked = ['create', 'edit', 'view', 'analytics'].includes(perm);
                }
            }
        });
    };
    
    TaskSystem.prototype.saveUser = function(event) {
        event.preventDefault();
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const studentId = document.getElementById('user-studentId').value.trim();
        
        if (!this.currentEditUserId && users.find(u => u.studentId === studentId)) {
            this.showToast('该学号已存在！', 'error');
            return;
        }
        
        const userData = {
            studentId,
            name: document.getElementById('user-name').value.trim(),
            role: document.getElementById('user-role').value,
            grade: document.getElementById('user-grade').value,
            level: document.getElementById('user-level').value,
            school: document.getElementById('user-school').value.trim(),
            phone: document.getElementById('user-phone').value.trim(),
            email: document.getElementById('user-email').value.trim(),
            password: document.getElementById('user-password').value,
            permissions: {
                create: document.getElementById('user-perm-create').checked,
                edit: document.getElementById('user-perm-edit').checked,
                delete: document.getElementById('user-perm-delete').checked,
                view: document.getElementById('user-perm-view').checked,
                analytics: document.getElementById('user-perm-analytics').checked,
                export: document.getElementById('user-perm-export').checked
            }
        };
        
        if (this.currentEditUserId) {
            const user = users.find(u => u.id === this.currentEditUserId);
            if (user) {
                Object.assign(user, userData);
            }
        } else {
            userData.id = Date.now();
            userData.token = btoa(studentId + ':' + Date.now());
            userData.registerTime = Date.now();
            users.push(userData);
        }
        
        localStorage.setItem('users', JSON.stringify(users));
        this.closeModal('user-modal');
        this.showToast('用户保存成功！', 'success');
        this.renderAdminUsers();
        this.loadAssigneeList();
    };
    
    TaskSystem.prototype.editUser = function(userId) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.id === userId);
        if (!user) return;
        
        this.currentEditUserId = userId;
        document.getElementById('user-modal-title').textContent = '编辑用户';
        
        document.getElementById('user-studentId').value = user.studentId;
        document.getElementById('user-name').value = user.name;
        document.getElementById('user-role').value = user.role || 'user';
        document.getElementById('user-grade').value = user.grade;
        document.getElementById('user-level').value = user.level;
        document.getElementById('user-school').value = user.school;
        document.getElementById('user-phone').value = user.phone;
        document.getElementById('user-email').value = user.email || '';
        document.getElementById('user-password').value = user.password;
        
        const permissions = user.permissions || {};
        document.getElementById('user-perm-create').checked = permissions.create || false;
        document.getElementById('user-perm-edit').checked = permissions.edit || false;
        document.getElementById('user-perm-delete').checked = permissions.delete || false;
        document.getElementById('user-perm-view').checked = permissions.view || false;
        document.getElementById('user-perm-analytics').checked = permissions.analytics || false;
        document.getElementById('user-perm-export').checked = permissions.export || false;
        
        document.getElementById('user-modal').classList.add('show');
    };
    
    TaskSystem.prototype.deleteUser = function(userId) {
        if (confirm('确定要删除该用户吗？此操作不可恢复！')) {
            let users = JSON.parse(localStorage.getItem('users') || '[]');
            users = users.filter(u => u.id !== userId);
            localStorage.setItem('users', JSON.stringify(users));
            this.showToast('用户已删除！', 'success');
            this.renderAdminUsers();
            this.loadAssigneeList();
        }
    };
    
    TaskSystem.prototype.viewUserLink = function(userId) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.id === userId);
        if (!user) return;
        
        const baseUrl = window.location.origin + window.location.pathname;
        const directUrl = `${baseUrl}?token=${user.token}`;
        
        const message = `用户：${user.name} (${user.studentId})\n\n直接登录链接：\n${directUrl}\n\n将此链接发送给用户即可直接登录`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(directUrl);
            alert(message + '\n\n链接已复制到剪贴板！');
        } else {
            alert(message);
        }
    };
    
    TaskSystem.prototype.searchAdminUsers = function() {
        const searchEl = document.getElementById('admin-search');
        if (!searchEl) return;
        
        const keyword = searchEl.value.toLowerCase();
        const cards = document.querySelectorAll('#admin-users-list .task-card');
        
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(keyword) ? '' : 'none';
        });
    };
    
    TaskSystem.prototype.filterAdminUsers = function() {
        const filterEl = document.getElementById('admin-role-filter');
        if (!filterEl) return;
        
        const role = filterEl.value;
        const cards = document.querySelectorAll('#admin-users-list .task-card');
        
        cards.forEach(card => {
            if (role === 'all') {
                card.style.display = '';
            } else {
                const isAdmin = card.textContent.includes('管理员');
                const shouldShow = (role === 'admin' && isAdmin) || (role === 'user' && !isAdmin);
                card.style.display = shouldShow ? '' : 'none';
            }
        });
    };
    
    TaskSystem.prototype.applyTemplate = function(templateName) {
        this.showToast('请在编辑用户时手动设置权限', 'error');
    };
    
    // 增强数据分析 - 添加人员统计
    TaskSystem.prototype.renderAnalytics = function() {
        if (originalRenderAnalytics) {
            originalRenderAnalytics.call(this);
        }
        
        // 添加人员统计
        const efficiencyEl = document.getElementById('efficiency-analysis');
        if (!efficiencyEl) return;
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userTaskStats = {};
        
        this.tasks.forEach(task => {
            const userId = task.assigneeId || task.userId;
            if (!userTaskStats[userId]) {
                userTaskStats[userId] = {
                    total: 0,
                    completed: 0,
                    hours: 0
                };
            }
            userTaskStats[userId].total++;
            if (task.status === 'completed') {
                userTaskStats[userId].completed++;
            }
            userTaskStats[userId].hours += task.actualHours || 0;
        });
        
        let statsHtml = '<div class="stat-card"><h4 style="margin-bottom: 16px; font-size: 16px;">👥 人员任务统计</h4>';
        
        Object.entries(userTaskStats).forEach(([userId, stats]) => {
            const user = users.find(u => u.id == userId);
            const userName = user ? user.name : '未知用户';
            const rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
            
            statsHtml += `
                <div class="stat-row">
                    <span>${userName}</span>
                    <strong>${stats.completed}/${stats.total} (${rate}%) · ${stats.hours.toFixed(1)}h</strong>
                </div>
            `;
        });
        
        statsHtml += '</div>';
        efficiencyEl.innerHTML = statsHtml;
    };
    
})();

console.log('✅ 系统增强功能已加载');

