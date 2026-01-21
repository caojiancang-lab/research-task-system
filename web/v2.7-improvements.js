// V2.7 改进脚本 - 权限、进度、完成按钮、科研进展周计划
// 在所有其他脚本之后加载

(function() {
    console.log('🔧 加载 V2.7 改进脚本...');
    
    // ==================== 1. 注册时普通用户默认只给查看权限 ====================
    
    // 修改管理员系统的默认权限设置
    if (typeof AdminSystem !== 'undefined') {
        const originalUpdatePermissionsByRole = AdminSystem.prototype.updatePermissionsByRole;
        AdminSystem.prototype.updatePermissionsByRole = function() {
            const role = document.getElementById('user-role').value;
            
            if (role === 'admin') {
                // 管理员：全部权限
                document.getElementById('user-perm-create').checked = true;
                document.getElementById('user-perm-edit').checked = true;
                document.getElementById('user-perm-delete').checked = true;
                document.getElementById('user-perm-view').checked = true;
                document.getElementById('user-perm-analytics').checked = true;
                document.getElementById('user-perm-export').checked = true;
            } else {
                // 普通用户：只有查看权限
                document.getElementById('user-perm-create').checked = false;
                document.getElementById('user-perm-edit').checked = false;
                document.getElementById('user-perm-delete').checked = false;
                document.getElementById('user-perm-view').checked = true;
                document.getElementById('user-perm-analytics').checked = false;
                document.getElementById('user-perm-export').checked = false;
            }
        };
    }
    
    // ==================== 2. 管理员更新进度时提示修改具体数值 ====================
    
    // 增强进度更新功能
    TaskSystem.prototype.showProgressModalEnhanced = function(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // 检查权限：只有管理员或任务指派人可以修改进度
        const isAdmin = this.currentUser.role === 'admin';
        const isAssigner = task.assignerId === this.currentUser.id;
        
        if (!isAdmin && !isAssigner) {
            this.showToast('只有管理员或任务指派人可以修改进度！', 'error');
            return;
        }
        
        // 创建进度修改模态框
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'progress-modal-enhanced';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📊 更新任务进度</h2>
                    <button class="close-btn" onclick="document.getElementById('progress-modal-enhanced').remove()">&times;</button>
                </div>
                <div style="padding: 24px;">
                    <div style="margin-bottom: 20px;">
                        <p style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">${this.escapeHtml(task.name)}</p>
                        <p style="color: #64748b; font-size: 14px;">当前进度: ${task.progress || 0}%</p>
                    </div>
                    
                    <div class="form-group">
                        <label style="font-weight: 600; margin-bottom: 8px; display: block;">新进度值 (%)</label>
                        <input type="number" id="new-progress-value" min="0" max="100" 
                            value="${task.progress || 0}" 
                            style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 16px;">
                        <div style="margin-top: 12px; display: flex; gap: 8px;">
                            <button class="btn btn-secondary" onclick="document.getElementById('new-progress-value').value = 25" style="flex: 1;">25%</button>
                            <button class="btn btn-secondary" onclick="document.getElementById('new-progress-value').value = 50" style="flex: 1;">50%</button>
                            <button class="btn btn-secondary" onclick="document.getElementById('new-progress-value').value = 75" style="flex: 1;">75%</button>
                            <button class="btn btn-secondary" onclick="document.getElementById('new-progress-value').value = 100" style="flex: 1;">100%</button>
                        </div>
                    </div>
                    
                    <div class="form-group" style="margin-top: 20px;">
                        <label style="font-weight: 600; margin-bottom: 8px; display: block;">进度说明（可选）</label>
                        <textarea id="progress-note" rows="3" 
                            style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px;"
                            placeholder="描述本次进度更新的具体内容..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="document.getElementById('progress-modal-enhanced').remove()">取消</button>
                    <button class="btn btn-primary" onclick="app.saveProgressEnhanced(${taskId})">确认更新</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    };
    
    // 保存进度更新
    TaskSystem.prototype.saveProgressEnhanced = function(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const newProgress = parseInt(document.getElementById('new-progress-value').value);
        const note = document.getElementById('progress-note').value.trim();
        
        if (isNaN(newProgress) || newProgress < 0 || newProgress > 100) {
            this.showToast('请输入有效的进度值（0-100）！', 'error');
            return;
        }
        
        // 更新进度
        const oldProgress = task.progress || 0;
        task.progress = newProgress;
        
        // 记录进度历史
        if (!task.progressHistory) {
            task.progressHistory = [];
        }
        task.progressHistory.push({
            time: Date.now(),
            progress: newProgress,
            note: note,
            updatedBy: this.currentUser.name
        });
        
        // 如果进度达到100%，自动更新状态
        if (newProgress === 100 && task.status !== 'completed') {
            task.status = 'review';
        }
        
        this.saveData();
        this.showToast(`进度已更新：${oldProgress}% → ${newProgress}%`, 'success');
        
        // 关闭模态框
        document.getElementById('progress-modal-enhanced').remove();
        
        // 刷新界面
        if (this.renderTasks) {
            this.renderTasks();
        }
        if (this.showTaskDetail) {
            this.showTaskDetail(taskId);
        }
    };
    
    // ==================== 3. 管理员一键完成按钮 ====================
    
    // 添加一键完成功能
    TaskSystem.prototype.quickCompleteTask = function(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // 只有管理员可以使用
        if (this.currentUser.role !== 'admin') {
            this.showToast('只有管理员可以使用一键完成功能！', 'error');
            return;
        }
        
        if (confirm(`确定要一键完成任务"${task.name}"吗？\n\n此操作将：\n- 进度设为 100%\n- 状态改为"已完成"\n- 记录完成时间`)) {
            task.progress = 100;
            task.status = 'completed';
            task.completeTime = Date.now();
            
            // 记录进度历史
            if (!task.progressHistory) {
                task.progressHistory = [];
            }
            task.progressHistory.push({
                time: Date.now(),
                progress: 100,
                note: '管理员一键完成',
                updatedBy: this.currentUser.name
            });
            
            this.saveData();
            this.showToast('任务已完成！', 'success');
            
            // 刷新界面
            if (this.renderTasks) {
                this.renderTasks();
            }
            if (this.showTaskDetail) {
                this.showTaskDetail(taskId);
            }
        }
    };
    
    // ==================== 4. 科研进展周计划系统 ====================
    
    // 科研进展周计划数据结构
    TaskSystem.prototype.weeklyPlans = [];
    
    // 加载周计划数据
    TaskSystem.prototype.loadWeeklyPlans = function() {
        const data = localStorage.getItem('weekly_plans');
        if (data) {
            this.weeklyPlans = JSON.parse(data);
        }
    };
    
    // 保存周计划数据
    TaskSystem.prototype.saveWeeklyPlans = function() {
        localStorage.setItem('weekly_plans', JSON.stringify(this.weeklyPlans));
    };
    
    // 获取周的起止日期
    TaskSystem.prototype.getWeekRange = function(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 周一为第一天
        
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
    
    // 显示科研进展周计划界面
    TaskSystem.prototype.showWeeklyPlanModal = function(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // 只有科研进展类型的任务才能填写周计划
        if (task.type !== '科研进展') {
            this.showToast('只有科研进展类型的任务可以填写周计划！', 'error');
            return;
        }
        
        const isAdmin = this.currentUser.role === 'admin';
        const isAssignee = task.assigneeId === this.currentUser.id;
        
        if (!isAdmin && !isAssignee) {
            this.showToast('您没有权限填写此任务的周计划！', 'error');
            return;
        }
        
        // 获取当前周、上周、下周的日期范围
        const thisWeek = this.getWeekRange(new Date());
        const lastWeek = this.getWeekRange(new Date(thisWeek.start - 7 * 24 * 60 * 60 * 1000));
        const nextWeek = this.getWeekRange(new Date(thisWeek.start + 7 * 24 * 60 * 60 * 1000));
        
        // 获取已有的周计划
        const lastWeekPlan = this.weeklyPlans.find(p => 
            p.taskId === taskId && p.weekStart === lastWeek.start
        );
        const thisWeekPlan = this.weeklyPlans.find(p => 
            p.taskId === taskId && p.weekStart === thisWeek.start
        );
        const nextWeekPlan = this.weeklyPlans.find(p => 
            p.taskId === taskId && p.weekStart === nextWeek.start
        );
        
        // 检查本周计划是否已提交或已审核
        const thisWeekSubmitted = thisWeekPlan && thisWeekPlan.submitted;
        const thisWeekApproved = thisWeekPlan && thisWeekPlan.approved;
        // 普通用户：提交后不能修改；管理员：始终可以修改
        const canEdit = isAdmin || (!thisWeekSubmitted && !thisWeekApproved);
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'weekly-plan-modal';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2>📅 科研进展周计划</h2>
                    <button class="close-btn" onclick="document.getElementById('weekly-plan-modal').remove()">&times;</button>
                </div>
                <div style="padding: 24px;">
                    <div style="margin-bottom: 20px; padding: 16px; background: #f8fafc; border-radius: 12px;">
                        <p style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">${this.escapeHtml(task.name)}</p>
                        <p style="color: #64748b; font-size: 14px;">接收人: ${this.escapeHtml(task.assigneeName || '')}</p>
                    </div>
                    
                    ${!canEdit && !isAdmin ? `
                        <div style="padding: 12px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; margin-bottom: 20px;">
                            <p style="color: #92400e; font-size: 14px; margin: 0;">
                                ⚠️ ${thisWeekApproved ? '本周计划已审核' : '本周计划已提交'}，无法修改。如需调整请联系管理员。
                            </p>
                        </div>
                    ` : ''}
                    
                    <!-- 上周计划（只读） -->
                    <div class="form-section" style="margin-bottom: 24px;">
                        <h3 style="display: flex; align-items: center; gap: 8px;">
                            <span>📋 上周计划</span>
                            <span style="font-size: 13px; color: #64748b; font-weight: normal;">
                                ${lastWeek.startStr} 至 ${lastWeek.endStr}
                            </span>
                            ${lastWeekPlan && lastWeekPlan.approved ? '<span style="font-size: 12px; padding: 4px 8px; background: #10b981; color: white; border-radius: 6px;">已审核</span>' : ''}
                        </h3>
                        <textarea readonly 
                            style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; background: #f8fafc; font-size: 14px; min-height: 80px;"
                            placeholder="暂无上周计划">${lastWeekPlan ? this.escapeHtml(lastWeekPlan.content) : ''}</textarea>
                    </div>
                    
                    <!-- 本周计划 -->
                    <div class="form-section" style="margin-bottom: 24px;">
                        <h3 style="display: flex; align-items: center; gap: 8px;">
                            <span>✍️ 本周计划</span>
                            <span style="font-size: 13px; color: #64748b; font-weight: normal;">
                                ${thisWeek.startStr} 至 ${thisWeek.endStr}
                            </span>
                            ${thisWeekPlan && thisWeekPlan.approved ? '<span style="font-size: 12px; padding: 4px 8px; background: #10b981; color: white; border-radius: 6px;">已审核</span>' : ''}
                        </h3>
                        <textarea id="this-week-plan" ${canEdit ? '' : 'readonly'}
                            style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; min-height: 120px; ${canEdit ? '' : 'background: #f8fafc;'}"
                            placeholder="请填写本周的科研计划和目标...">${thisWeekPlan ? this.escapeHtml(thisWeekPlan.content) : ''}</textarea>
                    </div>
                    
                    <!-- 下周计划 -->
                    <div class="form-section">
                        <h3 style="display: flex; align-items: center; gap: 8px;">
                            <span>🎯 下周计划</span>
                            <span style="font-size: 13px; color: #64748b; font-weight: normal;">
                                ${nextWeek.startStr} 至 ${nextWeek.endStr}
                            </span>
                            ${nextWeekPlan && nextWeekPlan.approved ? '<span style="font-size: 12px; padding: 4px 8px; background: #10b981; color: white; border-radius: 6px;">已审核</span>' : ''}
                        </h3>
                        <textarea id="next-week-plan" ${canEdit ? '' : 'readonly'}
                            style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; min-height: 120px; ${canEdit ? '' : 'background: #f8fafc;'}"
                            placeholder="请填写下周的科研计划和目标...">${nextWeekPlan ? this.escapeHtml(nextWeekPlan.content) : ''}</textarea>
                    </div>
                    
                    ${isAdmin && thisWeekPlan && !thisWeekPlan.approved ? `
                        <div style="margin-top: 20px; padding: 16px; background: #eff6ff; border-radius: 12px;">
                            <p style="font-size: 14px; color: #1e40af; margin-bottom: 12px;">
                                👑 管理员操作：审核本周计划
                            </p>
                            <button class="btn btn-primary" onclick="app.approveWeeklyPlan(${taskId}, ${thisWeek.start})" style="width: 100%;">
                                ✅ 审核通过
                            </button>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="document.getElementById('weekly-plan-modal').remove()">关闭</button>
                    ${canEdit ? `<button class="btn btn-primary" onclick="app.saveWeeklyPlan(${taskId})">保存计划</button>` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    };
    
    // 保存周计划
    TaskSystem.prototype.saveWeeklyPlan = function(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const thisWeekContent = document.getElementById('this-week-plan').value.trim();
        const nextWeekContent = document.getElementById('next-week-plan').value.trim();
        
        if (!thisWeekContent && !nextWeekContent) {
            this.showToast('请至少填写一项计划！', 'error');
            return;
        }
        
        const thisWeek = this.getWeekRange(new Date());
        const nextWeek = this.getWeekRange(new Date(thisWeek.start + 7 * 24 * 60 * 60 * 1000));
        
        const isAdmin = this.currentUser.role === 'admin';
        
        // 保存本周计划
        if (thisWeekContent) {
            const existingPlan = this.weeklyPlans.find(p => 
                p.taskId === taskId && p.weekStart === thisWeek.start
            );
            
            // 检查是否已提交或已审核（普通用户不能修改）
            if (existingPlan && (existingPlan.submitted || existingPlan.approved) && !isAdmin) {
                this.showToast('本周计划已提交，无法修改！', 'error');
                return;
            }
            
            if (existingPlan) {
                existingPlan.content = thisWeekContent;
                existingPlan.updateTime = Date.now();
                existingPlan.updatedBy = this.currentUser.name;
                if (!isAdmin) {
                    existingPlan.submitted = true;  // 标记为已提交
                }
            } else {
                this.weeklyPlans.push({
                    id: Date.now(),
                    taskId: taskId,
                    weekStart: thisWeek.start,
                    weekEnd: thisWeek.end,
                    content: thisWeekContent,
                    createTime: Date.now(),
                    updateTime: Date.now(),
                    createdBy: this.currentUser.name,
                    updatedBy: this.currentUser.name,
                    approved: false,
                    submitted: !isAdmin  // 普通用户提交后标记为已提交
                });
            }
        }
        
        // 保存下周计划
        if (nextWeekContent) {
            const existingPlan = this.weeklyPlans.find(p => 
                p.taskId === taskId && p.weekStart === nextWeek.start
            );
            
            // 检查是否已提交或已审核（普通用户不能修改）
            if (existingPlan && (existingPlan.submitted || existingPlan.approved) && !isAdmin) {
                this.showToast('下周计划已提交，无法修改！', 'error');
                return;
            }
            
            if (existingPlan) {
                existingPlan.content = nextWeekContent;
                existingPlan.updateTime = Date.now();
                existingPlan.updatedBy = this.currentUser.name;
                if (!isAdmin) {
                    existingPlan.submitted = true;  // 标记为已提交
                }
            } else {
                this.weeklyPlans.push({
                    id: Date.now() + 1,
                    taskId: taskId,
                    weekStart: nextWeek.start,
                    weekEnd: nextWeek.end,
                    content: nextWeekContent,
                    createTime: Date.now(),
                    updateTime: Date.now(),
                    createdBy: this.currentUser.name,
                    updatedBy: this.currentUser.name,
                    approved: false,
                    submitted: !isAdmin  // 普通用户提交后标记为已提交
                });
            }
        }
        
        this.saveWeeklyPlans();
        this.showToast(isAdmin ? '周计划已保存！' : '周计划已提交！', 'success');
        
        // 关闭并重新打开模态框以刷新内容
        document.getElementById('weekly-plan-modal').remove();
        setTimeout(() => this.showWeeklyPlanModal(taskId), 100);
    };
    
    // 审核周计划
    TaskSystem.prototype.approveWeeklyPlan = function(taskId, weekStart) {
        if (this.currentUser.role !== 'admin') {
            this.showToast('只有管理员可以审核周计划！', 'error');
            return;
        }
        
        const plan = this.weeklyPlans.find(p => 
            p.taskId === taskId && p.weekStart === weekStart
        );
        
        if (!plan) {
            this.showToast('未找到该周计划！', 'error');
            return;
        }
        
        if (confirm('确定要审核通过此周计划吗？\n\n审核后用户将无法修改。')) {
            plan.approved = true;
            plan.approvedBy = this.currentUser.name;
            plan.approvedTime = Date.now();
            
            this.saveWeeklyPlans();
            this.showToast('周计划已审核通过！', 'success');
            
            // 刷新界面
            document.getElementById('weekly-plan-modal').remove();
            setTimeout(() => this.showWeeklyPlanModal(taskId), 100);
        }
    };
    
    // ==================== 5. 初始化和集成 ====================
    
    // 在任务详情中添加按钮
    const originalShowTaskDetail = TaskSystem.prototype.showTaskDetail;
    TaskSystem.prototype.showTaskDetail = function(taskId) {
        if (originalShowTaskDetail) {
            originalShowTaskDetail.call(this, taskId);
        }
        
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // 等待详情界面渲染完成
        setTimeout(() => {
            const detailActions = document.querySelector('.detail-actions');
            if (!detailActions) return;
            
            const isAdmin = this.currentUser.role === 'admin';
            const isAssigner = task.assignerId === this.currentUser.id;
            
            // 添加进度更新按钮（管理员和指派人）
            if (isAdmin || isAssigner) {
                const progressBtn = document.createElement('button');
                progressBtn.className = 'btn btn-primary';
                progressBtn.innerHTML = '📊 更新进度';
                progressBtn.onclick = () => this.showProgressModalEnhanced(taskId);
                detailActions.appendChild(progressBtn);
            }
            
            // 添加一键完成按钮（仅管理员）
            if (isAdmin && task.status !== 'completed') {
                const quickCompleteBtn = document.createElement('button');
                quickCompleteBtn.className = 'btn btn-primary';
                quickCompleteBtn.style.background = '#10b981';
                quickCompleteBtn.innerHTML = '✅ 一键完成';
                quickCompleteBtn.onclick = () => this.quickCompleteTask(taskId);
                detailActions.appendChild(quickCompleteBtn);
            }
            
            // 添加周计划按钮（科研进展类型）
            if (task.type === '科研进展') {
                const weeklyPlanBtn = document.createElement('button');
                weeklyPlanBtn.className = 'btn btn-primary';
                weeklyPlanBtn.style.background = '#8b5cf6';
                weeklyPlanBtn.innerHTML = '📅 周计划';
                weeklyPlanBtn.onclick = () => this.showWeeklyPlanModal(taskId);
                detailActions.appendChild(weeklyPlanBtn);
            }
        }, 200);
    };
    
    // 页面加载时初始化
    function initV27Improvements() {
        if (typeof app !== 'undefined' && app.tasks) {
            // 加载周计划数据
            app.loadWeeklyPlans();
            
            console.log('✅ V2.7 改进脚本初始化完成');
            console.log('   - 普通用户默认只有查看权限');
            console.log('   - 管理员更新进度时可修改具体数值');
            console.log('   - 管理员可使用一键完成按钮');
            console.log('   - 科研进展周计划系统已启用');
        } else {
            setTimeout(initV27Improvements, 100);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initV27Improvements);
    } else {
        initV27Improvements();
    }
    
})();

