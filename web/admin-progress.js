// 科研进展管理功能扩展
// 在 admin-app.js 之后加载

(function() {
    console.log('🔧 加载科研进展管理功能...');
    
    if (typeof AdminSystem === 'undefined') {
        console.error('AdminSystem 未定义');
        return;
    }
    
    // ==================== 1. 科研进展管理功能 ====================
    
    // 加载科研进展数据
    AdminSystem.prototype.loadProgressData = function() {
        this.weeklyPlans = JSON.parse(localStorage.getItem('weekly_plans') || '[]');
        this.tasks = JSON.parse(localStorage.getItem('tasks_data') || '[]');
    };
    
    // 获取周范围
    AdminSystem.prototype.getWeekRange = function(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        
        const monday = new Date(d.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        
        return {
            start: monday.getTime(),
            end: sunday.getTime(),
            startStr: monday.toISOString().split('T')[0],
            endStr: sunday.toISOString().split('T')[0]
        };
    };
    
    // 渲染科研进展列表
    AdminSystem.prototype.renderProgressList = function() {
        this.loadProgressData();
        
        const container = document.getElementById('progress-list');
        if (!container) return;
        
        // 加载用户列表到筛选器
        const userFilter = document.getElementById('progress-user-filter');
        if (userFilter && userFilter.options.length === 1) {
            this.users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.name} (${user.studentId})`;
                userFilter.appendChild(option);
            });
        }
        
        // 获取筛选条件
        const selectedUserId = userFilter ? userFilter.value : 'all';
        const selectedWeek = document.getElementById('progress-week-filter')?.value || 'all';
        
        // 筛选周计划
        let filteredPlans = this.weeklyPlans;
        
        // 按用户筛选
        if (selectedUserId !== 'all') {
            filteredPlans = filteredPlans.filter(plan => {
                const task = this.tasks.find(t => t.id === plan.taskId);
                return task && (task.assigneeId == selectedUserId || task.userId == selectedUserId);
            });
        }
        
        // 按周次筛选
        if (selectedWeek !== 'all') {
            const now = new Date();
            let targetWeek;
            
            if (selectedWeek === 'current') {
                targetWeek = this.getWeekRange(now);
            } else if (selectedWeek === 'last') {
                const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                targetWeek = this.getWeekRange(lastWeek);
            } else if (selectedWeek === 'next') {
                const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                targetWeek = this.getWeekRange(nextWeek);
            }
            
            if (targetWeek) {
                filteredPlans = filteredPlans.filter(plan => 
                    plan.weekStart === targetWeek.start
                );
            }
        }
        
        if (filteredPlans.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>暂无科研进展数据</p></div>';
            return;
        }
        
        // 按任务分组
        const plansByTask = {};
        filteredPlans.forEach(plan => {
            if (!plansByTask[plan.taskId]) {
                plansByTask[plan.taskId] = [];
            }
            plansByTask[plan.taskId].push(plan);
        });
        
        // 渲染
        container.innerHTML = Object.entries(plansByTask).map(([taskId, plans]) => {
            const task = this.tasks.find(t => t.id == taskId);
            if (!task) return '';
            
            const user = this.users.find(u => u.id === task.assigneeId || u.id === task.userId);
            const userName = user ? user.name : '未知用户';
            const userStudentId = user ? user.studentId : '';
            
            // 按周排序
            plans.sort((a, b) => b.weekStart - a.weekStart);
            
            return `
                <div class="dashboard-card" style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <div>
                            <h3 style="margin: 0; font-size: 18px;">${this.escapeHtml(task.name)}</h3>
                            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">
                                提交人: ${userName} (${userStudentId})
                            </p>
                        </div>
                        <span class="task-badge badge-in-progress">${plans.length} 周</span>
                    </div>
                    
                    <div style="display: grid; gap: 12px;">
                        ${plans.map(plan => {
                            const weekRange = this.getWeekRange(new Date(plan.weekStart));
                            const isApproved = plan.approved;
                            
                            return `
                                <div style="padding: 16px; background: #f8fafc; border-radius: 12px; border-left: 4px solid ${isApproved ? '#10b981' : '#f59e0b'};">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                        <div>
                                            <strong style="font-size: 15px;">📅 ${weekRange.startStr} 至 ${weekRange.endStr}</strong>
                                            ${isApproved ? '<span style="margin-left: 12px; padding: 4px 8px; background: #10b981; color: white; border-radius: 6px; font-size: 12px;">已审核</span>' : '<span style="margin-left: 12px; padding: 4px 8px; background: #f59e0b; color: white; border-radius: 6px; font-size: 12px;">待审核</span>'}
                                        </div>
                                        <div style="display: flex; gap: 8px;">
                                            <button class="btn btn-secondary btn-icon" onclick="admin.viewProgressDetail(${plan.id})">查看</button>
                                            <button class="btn btn-secondary btn-icon" onclick="admin.editProgress(${plan.id})">编辑</button>
                                            ${!isApproved ? `<button class="btn btn-primary btn-icon" onclick="admin.approveProgress(${plan.id})">审核</button>` : ''}
                                        </div>
                                    </div>
                                    <div style="color: #64748b; font-size: 13px; line-height: 1.6;">
                                        ${this.escapeHtml(plan.content).substring(0, 150)}${plan.content.length > 150 ? '...' : ''}
                                    </div>
                                    <div style="margin-top: 8px; font-size: 12px; color: #94a3b8;">
                                        提交时间: ${new Date(plan.updateTime || plan.createTime).toLocaleString()}
                                        ${plan.approvedBy ? ` | 审核人: ${plan.approvedBy}` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    };
    
    // 筛选科研进展
    AdminSystem.prototype.filterProgress = function() {
        this.renderProgressList();
    };
    
    // 查看科研进展详情
    AdminSystem.prototype.viewProgressDetail = function(planId) {
        const plan = this.weeklyPlans.find(p => p.id === planId);
        if (!plan) return;
        
        const task = this.tasks.find(t => t.id === plan.taskId);
        const user = this.users.find(u => u.id === (task?.assigneeId || task?.userId));
        const weekRange = this.getWeekRange(new Date(plan.weekStart));
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2>📊 科研进展详情</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div style="padding: 24px;">
                    <div style="margin-bottom: 20px; padding: 16px; background: #f8fafc; border-radius: 12px;">
                        <p style="margin: 0 0 8px 0;"><strong>任务：</strong>${this.escapeHtml(task?.name || '')}</p>
                        <p style="margin: 0 0 8px 0;"><strong>提交人：</strong>${user?.name || '未知'} (${user?.studentId || ''})</p>
                        <p style="margin: 0 0 8px 0;"><strong>周次：</strong>${weekRange.startStr} 至 ${weekRange.endStr}</p>
                        <p style="margin: 0;"><strong>状态：</strong>${plan.approved ? '✅ 已审核' : '⏳ 待审核'}</p>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <h3 style="margin-bottom: 12px;">计划内容</h3>
                        <div style="padding: 16px; background: white; border: 2px solid #e2e8f0; border-radius: 12px; white-space: pre-wrap; line-height: 1.8;">
${this.escapeHtml(plan.content)}
                        </div>
                    </div>
                    
                    <div style="font-size: 13px; color: #64748b;">
                        <p style="margin: 4px 0;">创建时间: ${new Date(plan.createTime).toLocaleString()}</p>
                        <p style="margin: 4px 0;">更新时间: ${new Date(plan.updateTime).toLocaleString()}</p>
                        ${plan.approved ? `<p style="margin: 4px 0;">审核人: ${plan.approvedBy}</p>` : ''}
                        ${plan.approved ? `<p style="margin: 4px 0;">审核时间: ${new Date(plan.approvedTime).toLocaleString()}</p>` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">关闭</button>
                    ${!plan.approved ? `<button class="btn btn-primary" onclick="admin.approveProgress(${planId}); this.closest('.modal').remove();">审核通过</button>` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    };
    
    // 编辑科研进展
    AdminSystem.prototype.editProgress = function(planId) {
        const plan = this.weeklyPlans.find(p => p.id === planId);
        if (!plan) return;
        
        const task = this.tasks.find(t => t.id === plan.taskId);
        const user = this.users.find(u => u.id === (task?.assigneeId || task?.userId));
        const weekRange = this.getWeekRange(new Date(plan.weekStart));
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'edit-progress-modal';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2>✏️ 编辑科研进展</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div style="padding: 24px;">
                    <div style="margin-bottom: 20px; padding: 16px; background: #f8fafc; border-radius: 12px;">
                        <p style="margin: 0 0 8px 0;"><strong>任务：</strong>${this.escapeHtml(task?.name || '')}</p>
                        <p style="margin: 0 0 8px 0;"><strong>提交人：</strong>${user?.name || '未知'} (${user?.studentId || ''})</p>
                        <p style="margin: 0;"><strong>周次：</strong>${weekRange.startStr} 至 ${weekRange.endStr}</p>
                    </div>
                    
                    <div class="form-group">
                        <label style="font-weight: 600; margin-bottom: 8px; display: block;">计划内容</label>
                        <textarea id="edit-progress-content" rows="15" 
                            style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; line-height: 1.8;"
                            placeholder="请输入科研进展内容...">${this.escapeHtml(plan.content)}</textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">取消</button>
                    <button class="btn btn-primary" onclick="admin.saveProgressEdit(${planId})">保存修改</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    };
    
    // 保存科研进展编辑
    AdminSystem.prototype.saveProgressEdit = function(planId) {
        const content = document.getElementById('edit-progress-content')?.value.trim();
        if (!content) {
            this.showToast('请输入计划内容！', 'error');
            return;
        }
        
        const plan = this.weeklyPlans.find(p => p.id === planId);
        if (!plan) return;
        
        plan.content = content;
        plan.updateTime = Date.now();
        plan.updatedBy = this.currentAdmin.name + '(管理员)';
        
        localStorage.setItem('weekly_plans', JSON.stringify(this.weeklyPlans));
        
        this.showToast('科研进展已更新！', 'success');
        document.getElementById('edit-progress-modal')?.remove();
        this.renderProgressList();
    };
    
    // 审核科研进展
    AdminSystem.prototype.approveProgress = function(planId) {
        const plan = this.weeklyPlans.find(p => p.id === planId);
        if (!plan) return;
        
        if (confirm('确定要审核通过此科研进展吗？\n\n审核后用户将无法修改。')) {
            plan.approved = true;
            plan.approvedBy = this.currentAdmin.name;
            plan.approvedTime = Date.now();
            
            localStorage.setItem('weekly_plans', JSON.stringify(this.weeklyPlans));
            
            this.showToast('科研进展已审核通过！', 'success');
            this.renderProgressList();
        }
    };
    
    // ==================== 2. 扩展 showPage 方法 ====================
    
    const originalShowPage = AdminSystem.prototype.showPage;
    AdminSystem.prototype.showPage = function(pageName) {
        if (originalShowPage) {
            originalShowPage.call(this, pageName);
        }
        
        if (pageName === 'progress') {
            this.renderProgressList();
        }
    };
    
    console.log('✅ 科研进展管理功能已加载');
    
})();


