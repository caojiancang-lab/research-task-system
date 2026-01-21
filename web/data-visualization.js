// 数据可视化增强脚本
// 添加雷达图、直方图等可视化功能

(function() {
    // 增强数据分析页面
    TaskSystem.prototype.renderAnalytics = function() {
        const myTasks = this.tasks.filter(t => t.userId === this.currentUser.id);
        const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
        
        // 完成统计
        const stats = document.getElementById('completion-stats');
        const total = myTasks.length;
        const completed = myTasks.filter(t => t.status === 'completed').length;
        const rate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;
        
        stats.innerHTML = `
            <div class="stat-card">
                ${this.currentUser.role === 'admin' ? `
                    <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
                        <button class="btn btn-secondary btn-sm" onclick="app.showProjectProfile()">📊 项目画像</button>
                        <button class="btn btn-secondary btn-sm" onclick="app.showTeamEfficiency()">👥 团队效能</button>
                        <button class="btn btn-secondary btn-sm" onclick="app.showBudgetAnalysis()">💰 经费分析</button>
                    </div>
                ` : ''}
                <div class="stat-row">
                    <span>总任务数</span>
                    <strong style="font-size: 24px; color: #667eea;">${total}</strong>
                </div>
                <div class="stat-row">
                    <span>已完成</span>
                    <strong style="font-size: 24px; color: #10b981;">${completed}</strong>
                </div>
                <div class="stat-row">
                    <span>完成率</span>
                    <strong style="font-size: 24px; color: #f59e0b;">${rate}%</strong>
                </div>
            </div>
        `;
        
        // 时间分布 - 直方图
        const timeDistribution = document.getElementById('time-distribution');
        const typeStats = {};
        myTasks.forEach(t => {
            if (!typeStats[t.type]) typeStats[t.type] = { count: 0, hours: 0 };
            typeStats[t.type].count++;
            typeStats[t.type].hours += t.actualHours || 0;
        });
        
        const maxCount = Math.max(...Object.values(typeStats).map(s => s.count), 1);
        
        timeDistribution.innerHTML = `
            <div class="stat-card">
                <h4 style="margin-bottom: 16px; font-size: 14px; color: #64748b;">任务类型分布</h4>
                ${Object.entries(typeStats).map(([type, data]) => {
                    const percentage = (data.count / maxCount) * 100;
                    const colors = ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
                    const color = colors[Object.keys(typeStats).indexOf(type) % colors.length];
                    
                    return `
                        <div style="margin-bottom: 16px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
                                <span>${type}</span>
                                <span style="font-weight: 600;">${data.count}个 · ${data.hours.toFixed(1)}h</span>
                            </div>
                            <div style="height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden;">
                                <div style="height: 100%; width: ${percentage}%; background: ${color}; transition: width 0.5s;"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        // 效率分析 - 人员统计
        const efficiency = document.getElementById('efficiency-analysis');
        const userTaskStats = this.calculateUserStats();
        
        efficiency.innerHTML = `
            <div class="stat-card">
                <h4 style="margin-bottom: 16px; font-size: 14px; color: #64748b;">👥 人员任务统计</h4>
                ${Object.entries(userTaskStats).map(([userId, stats]) => {
                    const user = allUsers.find(u => u.id == userId);
                    const userName = user ? user.name : '未知用户';
                    const rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
                    const barColor = rate >= 80 ? '#10b981' : rate >= 60 ? '#f59e0b' : '#ef4444';
                    
                    return `
                        <div style="margin-bottom: 16px; padding: 12px; background: #f8fafc; border-radius: 8px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <strong>${userName}</strong>
                                <span style="font-size: 13px; color: #64748b;">${stats.completed}/${stats.total} · ${stats.hours.toFixed(1)}h</span>
                            </div>
                            <div style="height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                                <div style="height: 100%; width: ${rate}%; background: ${barColor}; transition: width 0.5s;"></div>
                            </div>
                            <div style="margin-top: 4px; font-size: 12px; color: ${barColor}; font-weight: 600;">
                                完成率: ${rate}%
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        // 成长曲线 - 排行榜
        const growth = document.getElementById('growth-curve');
        const topPerformers = this.getTopPerformers(userTaskStats, allUsers);
        const lazyPerformers = this.getLazyPerformers(allUsers);
        
        growth.innerHTML = `
            <div class="stat-card">
                <h4 style="margin-bottom: 16px; font-size: 14px; color: #64748b;">🏆 任务完成排行榜</h4>
                
                <div style="margin-bottom: 24px;">
                    <strong style="display: block; margin-bottom: 12px; color: #10b981;">✨ 完成最多 TOP 4</strong>
                    ${topPerformers.map((user, index) => {
                        const medals = ['🥇', '🥈', '🥉', '🏅'];
                        return `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin-bottom: 8px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 8px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-size: 24px;">${medals[index]}</span>
                                    <div>
                                        <strong style="display: block;">${user.name}</strong>
                                        <span style="font-size: 12px; color: #64748b;">完成率: ${user.rate}%</span>
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <strong style="display: block; color: #10b981;">${user.completed}个</strong>
                                    <span style="font-size: 12px; color: #64748b;">${user.hours.toFixed(1)}h</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                ${lazyPerformers.length > 0 ? `
                    <div>
                        <strong style="display: block; margin-bottom: 12px; color: #ef4444;">⚠️ 需要关注</strong>
                        ${lazyPerformers.map(user => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin-bottom: 8px; background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 8px;">
                                <div>
                                    <strong style="display: block;">${user.name}</strong>
                                    <span style="font-size: 12px; color: #64748b;">
                                        ${user.overdueCount}个任务超期 · 平均延期${user.avgDelay}天
                                    </span>
                                </div>
                                <span style="font-size: 20px;">😰</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    };
    
    // 计算用户统计数据
    TaskSystem.prototype.calculateUserStats = function() {
        const userTaskStats = {};
        
        this.tasks.forEach(task => {
            const userId = task.assigneeId || task.userId;
            if (!userTaskStats[userId]) {
                userTaskStats[userId] = {
                    total: 0,
                    completed: 0,
                    hours: 0,
                    overdue: 0
                };
            }
            userTaskStats[userId].total++;
            if (task.status === 'completed') {
                userTaskStats[userId].completed++;
            }
            userTaskStats[userId].hours += task.actualHours || 0;
            
            // 检查是否超期
            if (task.status !== 'completed' && new Date(task.deadline) < new Date()) {
                userTaskStats[userId].overdue++;
            }
        });
        
        return userTaskStats;
    };
    
    // 获取表现最好的用户
    TaskSystem.prototype.getTopPerformers = function(userTaskStats, allUsers) {
        const performers = Object.entries(userTaskStats).map(([userId, stats]) => {
            const user = allUsers.find(u => u.id == userId);
            const rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
            
            return {
                userId,
                name: user ? user.name : '未知用户',
                completed: stats.completed,
                total: stats.total,
                rate: rate,
                hours: stats.hours
            };
        });
        
        return performers
            .sort((a, b) => b.completed - a.completed)
            .slice(0, 4);
    };
    
    // 获取需要关注的用户（拖延）
    TaskSystem.prototype.getLazyPerformers = function(allUsers) {
        const lazyUsers = [];
        
        allUsers.forEach(user => {
            const userTasks = this.tasks.filter(t => t.assigneeId === user.id || t.userId === user.id);
            const overdueTasks = userTasks.filter(t => 
                t.status !== 'completed' && new Date(t.deadline) < new Date()
            );
            
            if (overdueTasks.length > 0) {
                // 计算平均延期天数
                const totalDelay = overdueTasks.reduce((sum, task) => {
                    const delay = Math.floor((Date.now() - new Date(task.deadline)) / (1000 * 60 * 60 * 24));
                    return sum + delay;
                }, 0);
                const avgDelay = Math.round(totalDelay / overdueTasks.length);
                
                lazyUsers.push({
                    name: user.name,
                    overdueCount: overdueTasks.length,
                    avgDelay: avgDelay
                });
            }
        });
        
        return lazyUsers.sort((a, b) => b.overdueCount - a.overdueCount).slice(0, 3);
    };
    
    // 添加查看个人详细统计的功能
    TaskSystem.prototype.showUserDetailStats = function(userId) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.id == userId);
        if (!user) return;
        
        const userTasks = this.tasks.filter(t => t.assigneeId === userId || t.userId === userId);
        const completed = userTasks.filter(t => t.status === 'completed').length;
        const inProgress = userTasks.filter(t => t.status === 'in-progress').length;
        const planning = userTasks.filter(t => t.status === 'planning').length;
        const totalHours = userTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📊 ${user.name} 的详细统计</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div style="padding: 24px;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
                        <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; margin-bottom: 4px;">${userTasks.length}</div>
                            <div style="font-size: 14px; opacity: 0.9;">总任务数</div>
                        </div>
                        <div style="padding: 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 12px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; margin-bottom: 4px;">${completed}</div>
                            <div style="font-size: 14px; opacity: 0.9;">已完成</div>
                        </div>
                        <div style="padding: 20px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border-radius: 12px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; margin-bottom: 4px;">${inProgress}</div>
                            <div style="font-size: 14px; opacity: 0.9;">进行中</div>
                        </div>
                        <div style="padding: 20px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border-radius: 12px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; margin-bottom: 4px;">${totalHours.toFixed(1)}h</div>
                            <div style="font-size: 14px; opacity: 0.9;">累计工时</div>
                        </div>
                    </div>
                    
                    <h4 style="margin-bottom: 12px;">任务列表</h4>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${userTasks.map(task => `
                            <div style="padding: 12px; margin-bottom: 8px; background: #f8fafc; border-radius: 8px; cursor: pointer;" onclick="app.showTaskDetail(${task.id}); this.closest('.modal').remove();">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                    <strong>${this.escapeHtml(task.name)}</strong>
                                    <span style="font-size: 12px; color: #667eea;">${task.taskNumber}</span>
                                </div>
                                <div style="font-size: 13px; color: #64748b;">
                                    进度: ${task.progress || 0}% · ${task.status === 'completed' ? '✅ 已完成' : '⏳ 进行中'}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">关闭</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };
    
    console.log('✅ 数据可视化增强已加载');
})();

