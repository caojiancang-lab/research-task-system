// 高级功能增强脚本 - v2.1
// 实现：完成权限控制、细粒度状态、子任务、风险预警、高级分析

(function() {
    // ==================== 1. 完成任务权限控制 ====================
    
    // 扩展权限系统，添加"完成任务"权限
    TaskSystem.prototype.initializeCompletePermission = function() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        let updated = false;
        
        users.forEach(user => {
            if (!user.permissions.hasOwnProperty('complete')) {
                // 管理员默认有完成权限
                user.permissions.complete = user.role === 'admin';
                updated = true;
            }
        });
        
        if (updated) {
            localStorage.setItem('users', JSON.stringify(users));
            // 更新当前用户
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser) {
                const updatedUser = users.find(u => u.id === currentUser.id);
                if (updatedUser) {
                    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                    this.currentUser = updatedUser;
                }
            }
        }
    };
    
    // 重写完成任务功能，添加权限检查
    const originalChangeTaskStatus = TaskSystem.prototype.changeTaskStatus;
    TaskSystem.prototype.changeTaskStatus = function(taskId, newStatus) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // 如果要标记为已完成，检查权限
        if (newStatus === 'completed' && !this.hasPermission('complete')) {
            this.showToast('您没有完成任务的权限！请联系管理员授权。', 'error');
            return;
        }
        
        if (originalChangeTaskStatus) {
            originalChangeTaskStatus.call(this, taskId, newStatus);
        }
    };
    
    // ==================== 2. 细粒度任务状态 ====================
    
    // 扩展任务状态系统
    const TASK_STATUSES = {
        'planning': { 
            text: '规划中', 
            class: 'badge-planning',
            color: '#3b82f6',
            next: ['in-progress', 'cancelled']
        },
        'in-progress': { 
            text: '进行中', 
            class: 'badge-in-progress',
            color: '#f59e0b',
            next: ['mid-check', 'paused', 'cancelled']
        },
        'mid-check': { 
            text: '中期检查', 
            class: 'badge-mid-check',
            color: '#8b5cf6',
            next: ['in-progress', 'review', 'revision']
        },
        'paused': { 
            text: '暂停', 
            class: 'badge-paused',
            color: '#6b7280',
            next: ['in-progress', 'cancelled']
        },
        'review': { 
            text: '待审核', 
            class: 'badge-review',
            color: '#6366f1',
            next: ['acceptance', 'revision']
        },
        'acceptance': { 
            text: '验收中', 
            class: 'badge-acceptance',
            color: '#14b8a6',
            next: ['quality-check', 'revision']
        },
        'quality-check': { 
            text: '质量检查', 
            class: 'badge-quality',
            color: '#06b6d4',
            next: ['completed', 'not-qualified', 'revision']
        },
        'not-qualified': { 
            text: '不达标', 
            class: 'badge-not-qualified',
            color: '#ef4444',
            next: ['revision', 'in-progress']
        },
        'revision': { 
            text: '修订中', 
            class: 'badge-revision',
            color: '#f97316',
            next: ['review', 'in-progress']
        },
        'completed': { 
            text: '已完成', 
            class: 'badge-completed',
            color: '#10b981',
            next: []
        },
        'cancelled': { 
            text: '已取消', 
            class: 'badge-cancelled',
            color: '#64748b',
            next: []
        }
    };
    
    // 获取状态信息
    TaskSystem.prototype.getStatusInfo = function(status) {
        return TASK_STATUSES[status] || TASK_STATUSES['planning'];
    };
    
    // 显示状态变更模态框
    TaskSystem.prototype.showStatusChangeModal = function(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const currentStatus = this.getStatusInfo(task.status);
        const nextStatuses = currentStatus.next;
        
        if (nextStatuses.length === 0) {
            this.showToast('该任务已处于终态，无法变更状态', 'warning');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'status-change-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🔄 变更任务状态</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <form onsubmit="app.submitStatusChange(event, ${taskId})">
                    <div style="padding: 24px;">
                        <div class="form-group">
                            <label>当前状态</label>
                            <div style="padding: 12px; background: ${currentStatus.color}20; border-radius: 8px; color: ${currentStatus.color}; font-weight: 600;">
                                ${currentStatus.text}
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>变更为 *</label>
                            <select id="new-status" required style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px;">
                                <option value="">请选择新状态</option>
                                ${nextStatuses.map(status => {
                                    const info = this.getStatusInfo(status);
                                    return `<option value="${status}">${info.text}</option>`;
                                }).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>变更说明</label>
                            <textarea id="status-change-reason" rows="4" 
                                placeholder="请说明状态变更的原因..."
                                style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-family: inherit;"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">取消</button>
                        <button type="submit" class="btn btn-primary">确认变更</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    };
    
    // 提交状态变更
    TaskSystem.prototype.submitStatusChange = function(event, taskId) {
        event.preventDefault();
        
        const newStatus = document.getElementById('new-status').value;
        const reason = document.getElementById('status-change-reason').value;
        
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // 检查完成权限
        if (newStatus === 'completed' && !this.hasPermission('complete')) {
            this.showToast('您没有完成任务的权限！', 'error');
            return;
        }
        
        // 记录状态变更历史
        if (!task.statusHistory) {
            task.statusHistory = [];
        }
        
        task.statusHistory.push({
            from: task.status,
            to: newStatus,
            reason: reason,
            operator: this.currentUser.name,
            time: Date.now()
        });
        
        task.status = newStatus;
        
        // 如果是完成状态，记录完成时间
        if (newStatus === 'completed') {
            task.progress = 100;
            task.completeTime = Date.now();
        }
        
        // 如果是不达标，记录不达标次数
        if (newStatus === 'not-qualified') {
            task.notQualifiedCount = (task.notQualifiedCount || 0) + 1;
        }
        
        this.saveData();
        document.getElementById('status-change-modal').remove();
        this.showToast('状态变更成功！', 'success');
        this.updateUI();
        this.renderTasks();
    };
    
    // ==================== 3. 子任务拆解功能 ====================
    
    // 显示子任务管理模态框
    TaskSystem.prototype.showSubtasksModal = function(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        if (!task.subtasks) {
            task.subtasks = [];
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'subtasks-modal';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2>📋 子任务管理</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div style="padding: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin: 0;">子任务列表</h3>
                        <button class="btn btn-primary btn-sm" onclick="app.showAddSubtaskForm(${taskId})">+ 添加子任务</button>
                    </div>
                    
                    <div id="subtasks-list">
                        ${this.renderSubtasksList(task)}
                    </div>
                    
                    <div style="margin-top: 24px; padding: 16px; background: #f8fafc; border-radius: 12px;">
                        <strong>子任务完成度：</strong>
                        <div style="margin-top: 8px;">
                            ${this.renderSubtasksProgress(task)}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">关闭</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };
    
    // 渲染子任务列表
    TaskSystem.prototype.renderSubtasksList = function(task) {
        if (!task.subtasks || task.subtasks.length === 0) {
            return '<div style="text-align: center; padding: 40px; color: #94a3b8;">暂无子任务，点击上方按钮添加</div>';
        }
        
        return task.subtasks.map((subtask, index) => `
            <div style="padding: 16px; margin-bottom: 12px; background: white; border: 2px solid ${subtask.completed ? '#10b981' : '#e2e8f0'}; border-radius: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                            <input type="checkbox" ${subtask.completed ? 'checked' : ''} 
                                onchange="app.toggleSubtask(${task.id}, ${index})"
                                style="width: 20px; height: 20px; cursor: pointer;">
                            <strong style="font-size: 16px; ${subtask.completed ? 'text-decoration: line-through; color: #94a3b8;' : ''}">${this.escapeHtml(subtask.title)}</strong>
                        </div>
                        ${subtask.description ? `<p style="margin: 8px 0 8px 32px; color: #64748b; font-size: 14px;">${this.escapeHtml(subtask.description)}</p>` : ''}
                        <div style="margin-left: 32px; font-size: 13px; color: #94a3b8;">
                            ${subtask.assignee ? `👤 ${subtask.assignee} · ` : ''}
                            ${subtask.deadline ? `📅 ${subtask.deadline}` : ''}
                            ${subtask.completedTime ? ` · ✅ 完成于 ${new Date(subtask.completedTime).toLocaleDateString()}` : ''}
                        </div>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="app.deleteSubtask(${task.id}, ${index})" style="background: #fee2e2; color: #991b1b;">删除</button>
                </div>
            </div>
        `).join('');
    };
    
    // 渲染子任务进度
    TaskSystem.prototype.renderSubtasksProgress = function(task) {
        if (!task.subtasks || task.subtasks.length === 0) {
            return '<span style="color: #94a3b8;">暂无子任务</span>';
        }
        
        const completed = task.subtasks.filter(s => s.completed).length;
        const total = task.subtasks.length;
        const percentage = Math.round((completed / total) * 100);
        
        return `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>${completed}/${total} 已完成</span>
                <span style="font-weight: 600; color: #667eea;">${percentage}%</span>
            </div>
            <div style="height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; width: ${percentage}%; background: linear-gradient(90deg, #667eea, #764ba2); transition: width 0.5s;"></div>
            </div>
        `;
    };
    
    // 显示添加子任务表单
    TaskSystem.prototype.showAddSubtaskForm = function(taskId) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        const formHtml = `
            <div style="margin-top: 20px; padding: 20px; background: #f8fafc; border-radius: 12px; border: 2px solid #667eea;">
                <h4 style="margin-bottom: 16px;">添加新子任务</h4>
                <form onsubmit="app.addSubtask(event, ${taskId})">
                    <div class="form-group">
                        <label>子任务标题 *</label>
                        <input type="text" id="subtask-title" required placeholder="例如：完成文献检索">
                    </div>
                    <div class="form-group">
                        <label>详细描述</label>
                        <textarea id="subtask-description" rows="2" placeholder="选填"></textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>负责人</label>
                            <select id="subtask-assignee">
                                <option value="">未指定</option>
                                ${users.map(u => `<option value="${u.name}">${u.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>截止日期</label>
                            <input type="date" id="subtask-deadline">
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px; justify-content: flex-end;">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="this.closest('div[style*=border]').remove()">取消</button>
                        <button type="submit" class="btn btn-primary btn-sm">添加</button>
                    </div>
                </form>
            </div>
        `;
        
        const listDiv = document.getElementById('subtasks-list');
        listDiv.insertAdjacentHTML('beforebegin', formHtml);
    };
    
    // 添加子任务
    TaskSystem.prototype.addSubtask = function(event, taskId) {
        event.preventDefault();
        
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        if (!task.subtasks) {
            task.subtasks = [];
        }
        
        const subtask = {
            id: Date.now(),
            title: document.getElementById('subtask-title').value,
            description: document.getElementById('subtask-description').value,
            assignee: document.getElementById('subtask-assignee').value,
            deadline: document.getElementById('subtask-deadline').value,
            completed: false,
            createdTime: Date.now()
        };
        
        task.subtasks.push(subtask);
        this.saveData();
        
        // 刷新显示
        document.getElementById('subtasks-modal').remove();
        this.showSubtasksModal(taskId);
        this.showToast('子任务添加成功！', 'success');
    };
    
    // 切换子任务完成状态
    TaskSystem.prototype.toggleSubtask = function(taskId, subtaskIndex) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task || !task.subtasks[subtaskIndex]) return;
        
        task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;
        
        if (task.subtasks[subtaskIndex].completed) {
            task.subtasks[subtaskIndex].completedTime = Date.now();
        } else {
            delete task.subtasks[subtaskIndex].completedTime;
        }
        
        this.saveData();
        
        // 刷新显示
        document.getElementById('subtasks-modal').remove();
        this.showSubtasksModal(taskId);
    };
    
    // 删除子任务
    TaskSystem.prototype.deleteSubtask = function(taskId, subtaskIndex) {
        if (!confirm('确定要删除这个子任务吗？')) return;
        
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        task.subtasks.splice(subtaskIndex, 1);
        this.saveData();
        
        // 刷新显示
        document.getElementById('subtasks-modal').remove();
        this.showSubtasksModal(taskId);
        this.showToast('子任务已删除', 'success');
    };
    
    // ==================== 4. 风险预警机制 ====================
    
    // 分析任务风险
    TaskSystem.prototype.analyzeTaskRisks = function(task) {
        const risks = [];
        const now = Date.now();
        const deadline = new Date(task.deadline).getTime();
        const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        
        // 1. 时间风险
        if (daysLeft < 0) {
            risks.push({
                level: 'high',
                type: '时间超期',
                message: `任务已超期 ${Math.abs(daysLeft)} 天`,
                icon: '🚨'
            });
        } else if (daysLeft <= 3 && task.progress < 80) {
            risks.push({
                level: 'high',
                type: '时间紧迫',
                message: `仅剩 ${daysLeft} 天，进度仅 ${task.progress}%`,
                icon: '⚠️'
            });
        } else if (daysLeft <= 7 && task.progress < 50) {
            risks.push({
                level: 'medium',
                type: '进度滞后',
                message: `剩余 ${daysLeft} 天，进度 ${task.progress}%，需加快`,
                icon: '⏰'
            });
        }
        
        // 2. 进度风险
        const expectedProgress = this.calculateExpectedProgress(task);
        if (task.progress < expectedProgress - 20) {
            risks.push({
                level: 'medium',
                type: '进度偏差',
                message: `实际进度 ${task.progress}%，预期应达 ${expectedProgress}%`,
                icon: '📉'
            });
        }
        
        // 3. 工时风险
        if (task.actualHours > task.estimatedHours * 1.2) {
            risks.push({
                level: 'medium',
                type: '工时超支',
                message: `实际工时 ${task.actualHours}h，预计 ${task.estimatedHours}h`,
                icon: '⏱️'
            });
        }
        
        // 4. 反馈风险
        if (task.feedbacks && task.feedbacks.length > 0) {
            const lastFeedback = task.feedbacks[task.feedbacks.length - 1];
            const daysSinceLastFeedback = Math.ceil((now - lastFeedback.time) / (1000 * 60 * 60 * 24));
            if (daysSinceLastFeedback > 7 && task.status !== 'completed') {
                risks.push({
                    level: 'low',
                    type: '沟通不足',
                    message: `已 ${daysSinceLastFeedback} 天未反馈`,
                    icon: '💬'
                });
            }
        }
        
        // 5. 子任务风险
        if (task.subtasks && task.subtasks.length > 0) {
            const completedSubtasks = task.subtasks.filter(s => s.completed).length;
            const subtaskProgress = Math.round((completedSubtasks / task.subtasks.length) * 100);
            if (subtaskProgress < task.progress - 10) {
                risks.push({
                    level: 'low',
                    type: '子任务滞后',
                    message: `子任务完成度 ${subtaskProgress}%，低于总进度`,
                    icon: '📋'
                });
            }
        }
        
        // 6. 不达标风险
        if (task.notQualifiedCount && task.notQualifiedCount > 0) {
            risks.push({
                level: 'high',
                type: '质量问题',
                message: `已 ${task.notQualifiedCount} 次不达标，需重点关注`,
                icon: '❌'
            });
        }
        
        return risks;
    };
    
    // 计算预期进度
    TaskSystem.prototype.calculateExpectedProgress = function(task) {
        const start = new Date(task.startDate).getTime();
        const end = new Date(task.deadline).getTime();
        const now = Date.now();
        
        if (now < start) return 0;
        if (now > end) return 100;
        
        const totalDuration = end - start;
        const elapsed = now - start;
        return Math.round((elapsed / totalDuration) * 100);
    };
    
    // 显示风险预警
    TaskSystem.prototype.showRiskWarning = function(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const risks = this.analyzeTaskRisks(task);
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>⚠️ 风险预警分析</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div style="padding: 24px;">
                    ${risks.length === 0 ? `
                        <div style="text-align: center; padding: 40px;">
                            <div style="font-size: 64px; margin-bottom: 16px;">✅</div>
                            <h3 style="color: #10b981;">任务状态良好</h3>
                            <p style="color: #64748b; margin-top: 8px;">未发现明显风险</p>
                        </div>
                    ` : `
                        <div style="margin-bottom: 20px;">
                            <strong>发现 ${risks.length} 个风险点：</strong>
                        </div>
                        ${risks.map(risk => {
                            const colors = {
                                high: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
                                medium: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
                                low: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' }
                            };
                            const color = colors[risk.level];
                            
                            return `
                                <div style="padding: 16px; margin-bottom: 12px; background: ${color.bg}; border-left: 4px solid ${color.border}; border-radius: 8px;">
                                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                                        <span style="font-size: 24px;">${risk.icon}</span>
                                        <strong style="color: ${color.text};">${risk.type}</strong>
                                    </div>
                                    <p style="margin-left: 36px; color: ${color.text};">${risk.message}</p>
                                </div>
                            `;
                        }).join('')}
                        
                        <div style="margin-top: 24px; padding: 16px; background: #f8fafc; border-radius: 12px;">
                            <strong>💡 建议措施：</strong>
                            <ul style="margin-top: 12px; padding-left: 20px; color: #64748b; line-height: 1.8;">
                                ${this.generateRiskSuggestions(risks).map(s => `<li>${s}</li>`).join('')}
                            </ul>
                        </div>
                    `}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">知道了</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };
    
    // 生成风险建议
    TaskSystem.prototype.generateRiskSuggestions = function(risks) {
        const suggestions = [];
        
        risks.forEach(risk => {
            switch(risk.type) {
                case '时间超期':
                case '时间紧迫':
                    suggestions.push('立即与团队沟通，评估是否需要延期或增加资源');
                    break;
                case '进度滞后':
                    suggestions.push('分析进度滞后原因，调整工作计划或优先级');
                    break;
                case '工时超支':
                    suggestions.push('评估任务复杂度是否被低估，考虑调整预期');
                    break;
                case '沟通不足':
                    suggestions.push('主动联系执行人，了解当前进展和困难');
                    break;
                case '质量问题':
                    suggestions.push('安排专项辅导，明确质量标准和验收要求');
                    break;
            }
        });
        
        return [...new Set(suggestions)]; // 去重
    };
    
    // 初始化完成权限
    if (app) {
        app.initializeCompletePermission();
    }
    
    console.log('✅ 高级功能增强已加载');
})();


