// 任务反馈和交互系统增强脚本
// 在 advanced-enhance.js 之后加载

(function() {
    // 扩展任务详情显示，添加反馈功能
    const originalShowTaskDetail = TaskSystem.prototype.showTaskDetail;
    
    TaskSystem.prototype.showTaskDetail = function(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const content = document.getElementById('task-detail-content');
        const isAssigner = task.assignerId === this.currentUser.id;
        const isAssignee = task.assigneeId === this.currentUser.id;
        
        // 获取状态信息
        const statusInfo = this.getStatusInfo ? this.getStatusInfo(task.status) : { text: task.status, color: '#667eea' };
        
        // 分析风险
        const risks = this.analyzeTaskRisks ? this.analyzeTaskRisks(task) : [];
        const riskCount = risks.length;
        const highRiskCount = risks.filter(r => r.level === 'high').length;
        
        content.innerHTML = `
            <div style="padding: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0;">${this.escapeHtml(task.name)}</h2>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span style="font-size: 14px; color: #667eea; font-weight: 600;">${task.taskNumber}</span>
                        <span style="padding: 6px 12px; background: ${statusInfo.color}20; color: ${statusInfo.color}; border-radius: 12px; font-size: 13px; font-weight: 600;">
                            ${statusInfo.text}
                        </span>
                    </div>
                </div>
                
                <!-- 快捷操作按钮 -->
                <div style="display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;">
                    <button class="btn btn-secondary btn-sm" onclick="app.showSubtasksModal(${task.id}); event.stopPropagation();">
                        📋 子任务管理 ${task.subtasks && task.subtasks.length > 0 ? `(${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length})` : ''}
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="app.showRiskWarning(${task.id}); event.stopPropagation();">
                        ⚠️ 风险预警 ${riskCount > 0 ? `(${riskCount}${highRiskCount > 0 ? ` · ${highRiskCount}高` : ''})` : ''}
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="app.showStatusChangeModal(${task.id}); event.stopPropagation();">
                        🔄 变更状态
                    </button>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
                    <div style="padding: 12px; background: #f8fafc; border-radius: 8px;">
                        <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">任务类型</div>
                        <div style="font-size: 14px; font-weight: 600;">${task.type}</div>
                    </div>
                    <div style="padding: 12px; background: #f8fafc; border-radius: 8px;">
                        <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">优先级</div>
                        <div style="font-size: 14px; font-weight: 600;">${task.priority}</div>
                    </div>
                    <div style="padding: 12px; background: #f8fafc; border-radius: 8px;">
                        <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">指派人</div>
                        <div style="font-size: 14px; font-weight: 600;">👤 ${task.assignerName}</div>
                    </div>
                    <div style="padding: 12px; background: #f8fafc; border-radius: 8px;">
                        <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">接收人</div>
                        <div style="font-size: 14px; font-weight: 600;">📥 ${task.assigneeName}</div>
                    </div>
                    <div style="padding: 12px; background: #f8fafc; border-radius: 8px;">
                        <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">开始日期</div>
                        <div style="font-size: 14px; font-weight: 600;">${task.startDate}</div>
                    </div>
                    <div style="padding: 12px; background: #f8fafc; border-radius: 8px;">
                        <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">截止日期</div>
                        <div style="font-size: 14px; font-weight: 600;">${task.deadline}</div>
                    </div>
                    <div style="padding: 12px; background: #f8fafc; border-radius: 8px;">
                        <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">预计工时</div>
                        <div style="font-size: 14px; font-weight: 600;">${task.estimatedHours}小时</div>
                    </div>
                    <div style="padding: 12px; background: #f8fafc; border-radius: 8px;">
                        <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">实际工时</div>
                        <div style="font-size: 14px; font-weight: 600;">${task.actualHours}小时</div>
                    </div>
                </div>
                
                ${task.description ? `
                    <div style="margin-bottom: 20px;">
                        <strong style="display: block; margin-bottom: 8px;">任务描述：</strong>
                        <p style="color: #64748b; line-height: 1.6;">${this.escapeHtml(task.description)}</p>
                    </div>
                ` : ''}
                
                ${task.steps && task.steps.length > 0 ? `
                    <div style="margin-bottom: 24px;">
                        <strong style="display: block; margin-bottom: 12px;">关键步骤：</strong>
                        <ul style="padding-left: 20px; color: #64748b; line-height: 1.8;">
                            ${task.steps.map(step => `<li>${this.escapeHtml(step)}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <!-- 状态变更历史 -->
                ${task.statusHistory && task.statusHistory.length > 0 ? `
                    <div style="margin-bottom: 24px;">
                        <strong style="display: block; margin-bottom: 12px;">📜 状态变更历史：</strong>
                        ${task.statusHistory.map(h => {
                            const fromInfo = this.getStatusInfo ? this.getStatusInfo(h.from) : { text: h.from };
                            const toInfo = this.getStatusInfo ? this.getStatusInfo(h.to) : { text: h.to };
                            return `
                                <div style="margin: 12px 0; padding: 16px; background: #f8fafc; border-left: 4px solid #667eea; border-radius: 8px;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                        <strong style="color: #667eea;">${new Date(h.time).toLocaleString()}</strong>
                                        <span style="font-weight: 600;">${fromInfo.text} → ${toInfo.text}</span>
                                    </div>
                                    <p style="margin: 8px 0;"><strong>操作人：</strong>${h.operator}</p>
                                    ${h.reason ? `<p style="margin: 8px 0;"><strong>说明：</strong>${this.escapeHtml(h.reason)}</p>` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : ''}
                
                <!-- 进度历史 -->
                ${task.progressHistory && task.progressHistory.length > 0 ? `
                    <div style="margin-bottom: 24px;">
                        <strong style="display: block; margin-bottom: 12px;">📊 进度历史：</strong>
                        ${task.progressHistory.map(h => `
                            <div style="margin: 12px 0; padding: 16px; background: #f8fafc; border-left: 4px solid #667eea; border-radius: 8px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <strong style="color: #667eea;">${new Date(h.time).toLocaleString()}</strong>
                                    <span style="font-weight: 600; color: #10b981;">进度: ${h.progress}%</span>
                                </div>
                                ${h.work ? `<p style="margin: 8px 0;"><strong>工作内容：</strong>${this.escapeHtml(h.work)}</p>` : ''}
                                ${h.issues ? `<p style="margin: 8px 0; color: #ef4444;"><strong>遇到问题：</strong>${this.escapeHtml(h.issues)}</p>` : ''}
                                ${h.hours ? `<p style="margin: 8px 0;"><strong>工时：</strong>${h.hours}小时</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <!-- 反馈交流区 -->
                <div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #e2e8f0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <strong style="font-size: 18px;">💬 反馈交流</strong>
                        ${isAssignee ? `
                            <button class="btn btn-primary btn-sm" onclick="app.showFeedbackModal(${task.id})">
                                📝 提交反馈
                            </button>
                        ` : ''}
                    </div>
                    
                    <div id="feedback-list-${task.id}">
                        ${this.renderFeedbackList ? this.renderFeedbackList(task) : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('task-detail-modal').classList.add('show');
        
        // 标记为已读
        if (this.markFeedbackAsRead) {
            this.markFeedbackAsRead(task.id);
        }
    };
    
    // 渲染反馈列表
    TaskSystem.prototype.renderFeedbackList = function(task) {
        if (!task.feedbacks || task.feedbacks.length === 0) {
            return '<div style="text-align: center; padding: 40px; color: #94a3b8;">暂无反馈信息</div>';
        }
        
        return task.feedbacks.map(feedback => {
            const isAssigner = feedback.userId === task.assignerId;
            const bgColor = isAssigner ? '#e0e7ff' : '#dbeafe';
            const borderColor = isAssigner ? '#667eea' : '#3b82f6';
            
            return `
                <div style="margin-bottom: 16px; padding: 16px; background: ${bgColor}; border-left: 4px solid ${borderColor}; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div>
                            <strong style="color: ${borderColor};">
                                ${isAssigner ? '👤 指派人' : '📥 接收人'}: ${this.escapeHtml(feedback.userName)}
                            </strong>
                        </div>
                        <span style="font-size: 12px; color: #64748b;">
                            ${new Date(feedback.time).toLocaleString()}
                        </span>
                    </div>
                    <p style="margin: 8px 0; line-height: 1.6; color: #1e293b;">
                        ${this.escapeHtml(feedback.content)}
                    </p>
                    ${feedback.reply ? `
                        <div style="margin-top: 12px; padding: 12px; background: white; border-radius: 6px;">
                            <strong style="font-size: 13px; color: #667eea;">回复：</strong>
                            <p style="margin: 4px 0; color: #475569;">${this.escapeHtml(feedback.reply)}</p>
                        </div>
                    ` : (task.assignerId === this.currentUser.id && !isAssigner ? `
                        <button class="btn btn-secondary btn-sm" onclick="app.showReplyModal(${task.id}, ${feedback.id})" style="margin-top: 8px;">
                            💬 回复
                        </button>
                    ` : '')}
                </div>
            `;
        }).join('');
    };
    
    // 显示反馈模态框
    TaskSystem.prototype.showFeedbackModal = function(taskId) {
        this.currentTaskId = taskId;
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'feedback-modal-temp';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📝 提交反馈</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <form onsubmit="app.submitFeedback(event, ${taskId})">
                    <div style="padding: 24px;">
                        <div class="form-group">
                            <label>反馈内容 *</label>
                            <textarea id="feedback-content" rows="6" required 
                                placeholder="请描述当前进展、遇到的问题、需要的帮助等..."
                                style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-family: inherit;"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">取消</button>
                        <button type="submit" class="btn btn-primary">提交反馈</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    };
    
    // 提交反馈
    TaskSystem.prototype.submitFeedback = function(event, taskId) {
        event.preventDefault();
        
        const content = document.getElementById('feedback-content').value.trim();
        if (!content) {
            this.showToast('请输入反馈内容！', 'error');
            return;
        }
        
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        if (!task.feedbacks) {
            task.feedbacks = [];
        }
        
        const feedback = {
            id: Date.now(),
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            content: content,
            time: Date.now(),
            reply: null
        };
        
        task.feedbacks.push(feedback);
        this.saveData();
        
        document.getElementById('feedback-modal-temp').remove();
        this.showToast('反馈提交成功！', 'success');
        this.showTaskDetail(taskId);
    };
    
    // 显示回复模态框
    TaskSystem.prototype.showReplyModal = function(taskId, feedbackId) {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'reply-modal-temp';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>💬 回复反馈</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <form onsubmit="app.submitReply(event, ${taskId}, ${feedbackId})">
                    <div style="padding: 24px;">
                        <div class="form-group">
                            <label>回复内容 *</label>
                            <textarea id="reply-content" rows="4" required 
                                placeholder="请输入您的回复..."
                                style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-family: inherit;"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">取消</button>
                        <button type="submit" class="btn btn-primary">提交回复</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    };
    
    // 提交回复
    TaskSystem.prototype.submitReply = function(event, taskId, feedbackId) {
        event.preventDefault();
        
        const content = document.getElementById('reply-content').value.trim();
        if (!content) {
            this.showToast('请输入回复内容！', 'error');
            return;
        }
        
        const task = this.tasks.find(t => t.id === taskId);
        if (!task || !task.feedbacks) return;
        
        const feedback = task.feedbacks.find(f => f.id === feedbackId);
        if (feedback) {
            feedback.reply = content;
            feedback.replyTime = Date.now();
            this.saveData();
            
            document.getElementById('reply-modal-temp').remove();
            this.showToast('回复成功！', 'success');
            this.showTaskDetail(taskId);
        }
    };
    
    console.log('✅ 任务反馈系统已加载');
})();

