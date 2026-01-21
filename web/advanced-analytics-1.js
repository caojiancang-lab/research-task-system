// 高级数据分析模块 - Part 1
// 项目画像分析、团队效能分析

(function() {
    // ==================== 项目画像分析 ====================
    
    TaskSystem.prototype.showProjectProfile = function() {
        const allTasks = this.tasks;
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // 计算项目画像数据
        const profile = {
            totalTasks: allTasks.length,
            totalUsers: users.length,
            activeUsers: this.getActiveUsers().length,
            totalHours: allTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0),
            avgTaskDuration: this.calculateAvgTaskDuration(),
            completionRate: this.calculateCompletionRate(),
            onTimeRate: this.calculateOnTimeRate(),
            qualityScore: this.calculateQualityScore(),
            riskLevel: this.calculateOverallRiskLevel(),
            taskDistribution: this.getTaskDistribution(),
            statusDistribution: this.getStatusDistribution(),
            priorityDistribution: this.getPriorityDistribution()
        };
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2>📊 项目画像分析</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div style="padding: 24px; max-height: 70vh; overflow-y: auto;">
                    <!-- 核心指标 -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
                        <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; margin-bottom: 4px;">${profile.totalTasks}</div>
                            <div style="font-size: 14px; opacity: 0.9;">总任务数</div>
                        </div>
                        <div style="padding: 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 12px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; margin-bottom: 4px;">${profile.completionRate}%</div>
                            <div style="font-size: 14px; opacity: 0.9;">完成率</div>
                        </div>
                        <div style="padding: 20px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border-radius: 12px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; margin-bottom: 4px;">${profile.onTimeRate}%</div>
                            <div style="font-size: 14px; opacity: 0.9;">按时率</div>
                        </div>
                        <div style="padding: 20px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border-radius: 12px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; margin-bottom: 4px;">${profile.totalHours.toFixed(0)}h</div>
                            <div style="font-size: 14px; opacity: 0.9;">累计工时</div>
                        </div>
                    </div>
                    
                    <!-- 项目健康度 -->
                    <div style="margin-bottom: 24px; padding: 20px; background: #f8fafc; border-radius: 12px;">
                        <h3 style="margin-bottom: 16px;">🏥 项目健康度</h3>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                            <div>
                                <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">质量评分</div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div style="flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                                        <div style="height: 100%; width: ${profile.qualityScore}%; background: ${this.getScoreColor(profile.qualityScore)}; transition: width 0.5s;"></div>
                                    </div>
                                    <strong style="color: ${this.getScoreColor(profile.qualityScore)};">${profile.qualityScore}分</strong>
                                </div>
                            </div>
                            <div>
                                <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">风险等级</div>
                                <div style="padding: 8px 16px; background: ${this.getRiskLevelColor(profile.riskLevel).bg}; color: ${this.getRiskLevelColor(profile.riskLevel).text}; border-radius: 8px; text-align: center; font-weight: 600;">
                                    ${profile.riskLevel}
                                </div>
                            </div>
                            <div>
                                <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">活跃用户</div>
                                <div style="font-size: 24px; font-weight: 700; color: #667eea;">${profile.activeUsers}/${profile.totalUsers}</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 任务分布 -->
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
                        <div style="padding: 20px; background: white; border: 2px solid #e2e8f0; border-radius: 12px;">
                            <h4 style="margin-bottom: 16px;">任务类型分布</h4>
                            ${this.renderDistributionChart(profile.taskDistribution)}
                        </div>
                        <div style="padding: 20px; background: white; border: 2px solid #e2e8f0; border-radius: 12px;">
                            <h4 style="margin-bottom: 16px;">任务状态分布</h4>
                            ${this.renderDistributionChart(profile.statusDistribution)}
                        </div>
                    </div>
                    
                    <!-- 优先级分布 -->
                    <div style="padding: 20px; background: white; border: 2px solid #e2e8f0; border-radius: 12px;">
                        <h4 style="margin-bottom: 16px;">优先级分布</h4>
                        ${this.renderDistributionChart(profile.priorityDistribution)}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="app.exportProjectReport()">导出报告</button>
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">关闭</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };
    
    // 计算平均任务时长
    TaskSystem.prototype.calculateAvgTaskDuration = function() {
        const completedTasks = this.tasks.filter(t => t.status === 'completed' && t.completeTime);
        if (completedTasks.length === 0) return 0;
        
        const totalDuration = completedTasks.reduce((sum, t) => {
            const start = new Date(t.startDate).getTime();
            const end = t.completeTime;
            return sum + (end - start);
        }, 0);
        
        return Math.round(totalDuration / completedTasks.length / (1000 * 60 * 60 * 24));
    };
    
    // 计算完成率
    TaskSystem.prototype.calculateCompletionRate = function() {
        if (this.tasks.length === 0) return 0;
        const completed = this.tasks.filter(t => t.status === 'completed').length;
        return Math.round((completed / this.tasks.length) * 100);
    };
    
    // 计算按时率
    TaskSystem.prototype.calculateOnTimeRate = function() {
        const completedTasks = this.tasks.filter(t => t.status === 'completed' && t.completeTime);
        if (completedTasks.length === 0) return 0;
        
        const onTime = completedTasks.filter(t => {
            const deadline = new Date(t.deadline).getTime();
            return t.completeTime <= deadline;
        }).length;
        
        return Math.round((onTime / completedTasks.length) * 100);
    };
    
    // 计算质量评分
    TaskSystem.prototype.calculateQualityScore = function() {
        let score = 100;
        
        // 扣分项
        const notQualifiedTasks = this.tasks.filter(t => t.notQualifiedCount && t.notQualifiedCount > 0);
        score -= notQualifiedTasks.length * 5; // 每个不达标任务扣5分
        
        const overdueTasks = this.tasks.filter(t => {
            if (t.status === 'completed') return false;
            return new Date(t.deadline) < new Date();
        });
        score -= overdueTasks.length * 3; // 每个超期任务扣3分
        
        return Math.max(0, Math.min(100, score));
    };
    
    // 计算整体风险等级
    TaskSystem.prototype.calculateOverallRiskLevel = function() {
        let riskScore = 0;
        
        this.tasks.forEach(task => {
            const risks = this.analyzeTaskRisks(task);
            risks.forEach(risk => {
                if (risk.level === 'high') riskScore += 3;
                else if (risk.level === 'medium') riskScore += 2;
                else riskScore += 1;
            });
        });
        
        if (riskScore === 0) return '低风险';
        if (riskScore < 10) return '中低风险';
        if (riskScore < 20) return '中等风险';
        if (riskScore < 30) return '中高风险';
        return '高风险';
    };
    
    // 获取活跃用户
    TaskSystem.prototype.getActiveUsers = function() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        return users.filter(user => {
            const userTasks = this.tasks.filter(t => 
                t.userId === user.id || t.assigneeId === user.id
            );
            
            return userTasks.some(t => 
                t.createTime > thirtyDaysAgo || 
                (t.completeTime && t.completeTime > thirtyDaysAgo)
            );
        });
    };
    
    // 获取任务分布
    TaskSystem.prototype.getTaskDistribution = function() {
        const distribution = {};
        this.tasks.forEach(t => {
            distribution[t.type] = (distribution[t.type] || 0) + 1;
        });
        return distribution;
    };
    
    // 获取状态分布
    TaskSystem.prototype.getStatusDistribution = function() {
        const distribution = {};
        this.tasks.forEach(t => {
            const statusInfo = this.getStatusInfo(t.status);
            distribution[statusInfo.text] = (distribution[statusInfo.text] || 0) + 1;
        });
        return distribution;
    };
    
    // 获取优先级分布
    TaskSystem.prototype.getPriorityDistribution = function() {
        const distribution = {};
        this.tasks.forEach(t => {
            distribution[t.priority] = (distribution[t.priority] || 0) + 1;
        });
        return distribution;
    };
    
    // 渲染分布图表
    TaskSystem.prototype.renderDistributionChart = function(data) {
        const total = Object.values(data).reduce((sum, v) => sum + v, 0);
        const maxValue = Math.max(...Object.values(data));
        
        return Object.entries(data).map(([key, value]) => {
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            const barWidth = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
            const colors = ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
            const color = colors[Object.keys(data).indexOf(key) % colors.length];
            
            return `
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
                        <span>${key}</span>
                        <span style="font-weight: 600;">${value}个 (${percentage}%)</span>
                    </div>
                    <div style="height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${barWidth}%; background: ${color}; transition: width 0.5s;"></div>
                    </div>
                </div>
            `;
        }).join('');
    };
    
    // 获取评分颜色
    TaskSystem.prototype.getScoreColor = function(score) {
        if (score >= 90) return '#10b981';
        if (score >= 70) return '#f59e0b';
        return '#ef4444';
    };
    
    // 获取风险等级颜色
    TaskSystem.prototype.getRiskLevelColor = function(level) {
        const colors = {
            '低风险': { bg: '#d1fae5', text: '#065f46' },
            '中低风险': { bg: '#dbeafe', text: '#1e40af' },
            '中等风险': { bg: '#fef3c7', text: '#92400e' },
            '中高风险': { bg: '#fed7aa', text: '#9a3412' },
            '高风险': { bg: '#fee2e2', text: '#991b1b' }
        };
        return colors[level] || colors['中等风险'];
    };
    
    // ==================== 团队效能分析 ====================
    
    TaskSystem.prototype.showTeamEfficiency = function() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const teamData = this.calculateTeamEfficiency(users);
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2>👥 团队效能分析</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div style="padding: 24px; max-height: 70vh; overflow-y: auto;">
                    <!-- 团队概览 -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
                        <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; margin-bottom: 4px;">${teamData.totalMembers}</div>
                            <div style="font-size: 14px; opacity: 0.9;">团队成员</div>
                        </div>
                        <div style="padding: 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 12px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; margin-bottom: 4px;">${teamData.avgProductivity.toFixed(1)}</div>
                            <div style="font-size: 14px; opacity: 0.9;">平均生产力</div>
                        </div>
                        <div style="padding: 20px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border-radius: 12px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; margin-bottom: 4px;">${teamData.avgCompletionRate}%</div>
                            <div style="font-size: 14px; opacity: 0.9;">平均完成率</div>
                        </div>
                        <div style="padding: 20px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border-radius: 12px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; margin-bottom: 4px;">${teamData.totalHours.toFixed(0)}h</div>
                            <div style="font-size: 14px; opacity: 0.9;">团队总工时</div>
                        </div>
                    </div>
                    
                    <!-- 成员效能排名 -->
                    <div style="margin-bottom: 24px;">
                        <h3 style="margin-bottom: 16px;">📈 成员效能排名</h3>
                        ${teamData.memberRanking.map((member, index) => `
                            <div style="padding: 16px; margin-bottom: 12px; background: ${index < 3 ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : 'white'}; border: 2px solid ${index < 3 ? '#10b981' : '#e2e8f0'}; border-radius: 12px;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div style="display: flex; align-items: center; gap: 16px;">
                                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700;">
                                            ${index + 1}
                                        </div>
                                        <div>
                                            <strong style="font-size: 16px;">${member.name}</strong>
                                            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">
                                                ${member.tasks}个任务 · ${member.hours.toFixed(1)}h工时
                                            </div>
                                        </div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="font-size: 24px; font-weight: 700; color: #667eea;">${member.efficiency.toFixed(1)}</div>
                                        <div style="font-size: 13px; color: #64748b;">效能指数</div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- 协作网络 -->
                    <div style="padding: 20px; background: #f8fafc; border-radius: 12px;">
                        <h3 style="margin-bottom: 16px;">🤝 协作网络分析</h3>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                            <div>
                                <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">协作密度</div>
                                <div style="font-size: 24px; font-weight: 700; color: #667eea;">${teamData.collaborationDensity}%</div>
                            </div>
                            <div>
                                <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">平均响应时间</div>
                                <div style="font-size: 24px; font-weight: 700; color: #10b981;">${teamData.avgResponseTime}h</div>
                            </div>
                            <div>
                                <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">团队凝聚力</div>
                                <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">${teamData.teamCohesion}分</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="app.exportTeamReport()">导出报告</button>
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">关闭</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };
    
    // 计算团队效能
    TaskSystem.prototype.calculateTeamEfficiency = function(users) {
        const memberStats = users.map(user => {
            const userTasks = this.tasks.filter(t => t.userId === user.id || t.assigneeId === user.id);
            const completed = userTasks.filter(t => t.status === 'completed').length;
            const hours = userTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
            const completionRate = userTasks.length > 0 ? Math.round((completed / userTasks.length) * 100) : 0;
            
            // 效能指数 = (完成任务数 * 2 + 完成率) / (工时 / 10)
            const efficiency = hours > 0 ? ((completed * 2 + completionRate) / (hours / 10)) : 0;
            
            return {
                name: user.name,
                tasks: userTasks.length,
                completed: completed,
                hours: hours,
                completionRate: completionRate,
                efficiency: efficiency
            };
        });
        
        const totalMembers = users.length;
        const avgProductivity = memberStats.reduce((sum, m) => sum + m.completed, 0) / totalMembers;
        const avgCompletionRate = Math.round(memberStats.reduce((sum, m) => sum + m.completionRate, 0) / totalMembers);
        const totalHours = memberStats.reduce((sum, m) => sum + m.hours, 0);
        
        // 协作密度：有反馈交流的任务比例
        const tasksWithFeedback = this.tasks.filter(t => t.feedbacks && t.feedbacks.length > 0).length;
        const collaborationDensity = this.tasks.length > 0 ? Math.round((tasksWithFeedback / this.tasks.length) * 100) : 0;
        
        // 平均响应时间
        let totalResponseTime = 0;
        let responseCount = 0;
        this.tasks.forEach(task => {
            if (task.feedbacks && task.feedbacks.length > 0) {
                task.feedbacks.forEach(feedback => {
                    if (feedback.reply && feedback.replyTime) {
                        totalResponseTime += (feedback.replyTime - feedback.time) / (1000 * 60 * 60);
                        responseCount++;
                    }
                });
            }
        });
        const avgResponseTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0;
        
        // 团队凝聚力评分
        const teamCohesion = Math.min(100, Math.round(
            (collaborationDensity * 0.4) + 
            (avgCompletionRate * 0.4) + 
            (Math.max(0, 100 - avgResponseTime * 2) * 0.2)
        ));
        
        return {
            totalMembers,
            avgProductivity,
            avgCompletionRate,
            totalHours,
            memberRanking: memberStats.sort((a, b) => b.efficiency - a.efficiency),
            collaborationDensity,
            avgResponseTime,
            teamCohesion
        };
    };
    
    // 导出项目报告
    TaskSystem.prototype.exportProjectReport = function() {
        this.showToast('报告导出功能开发中...', 'info');
    };
    
    // 导出团队报告
    TaskSystem.prototype.exportTeamReport = function() {
        this.showToast('报告导出功能开发中...', 'info');
    };
    
    console.log('✅ 高级数据分析模块 Part 1 已加载');
})();


