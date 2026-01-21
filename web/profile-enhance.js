// 个人中心增强脚本
// 管理员可以查看和编辑所有人的信息

(function() {
    // 增强个人中心页面
    TaskSystem.prototype.renderProfile = function() {
        const isAdmin = this.currentUser.role === 'admin';
        
        if (isAdmin) {
            // 管理员视图：可以查看所有人
            this.renderAdminProfileView();
        } else {
            // 普通用户视图：只能看自己
            this.renderUserProfileView();
        }
    };
    
    // 管理员个人中心视图
    TaskSystem.prototype.renderAdminProfileView = function() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        const profilePage = document.getElementById('profile-page');
        profilePage.innerHTML = `
            <div class="page-header">
                <h1>个人中心</h1>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-secondary" onclick="app.renderUserProfileView()">查看我的信息</button>
                    <button class="btn btn-primary" onclick="app.renderAdminProfileView()">查看所有人</button>
                </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 32px; border-radius: 16px; margin-bottom: 24px;">
                <h2 style="font-size: 24px; margin-bottom: 8px;">👑 管理员视图</h2>
                <p style="opacity: 0.9;">您可以查看和编辑所有用户的信息</p>
            </div>
            
            <div style="margin-bottom: 20px; display: flex; gap: 12px;">
                <input type="text" id="profile-search" placeholder="搜索用户（姓名、学号）" 
                    style="flex: 1; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px;"
                    oninput="app.searchProfileUsers()">
                <select id="profile-role-filter" onchange="app.filterProfileUsers()" 
                    style="padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px;">
                    <option value="all">全部角色</option>
                    <option value="admin">管理员</option>
                    <option value="user">普通用户</option>
                </select>
            </div>
            
            <div id="all-users-list">
                ${users.map(user => this.renderUserCard(user)).join('')}
            </div>
        `;
    };
    
    // 渲染用户卡片
    TaskSystem.prototype.renderUserCard = function(user) {
        const userTasks = this.tasks.filter(t => t.assigneeId === user.id || t.userId === user.id);
        const completed = userTasks.filter(t => t.status === 'completed').length;
        const total = userTasks.length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        const totalHours = userTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
        
        const permissions = user.permissions || {};
        const permCount = Object.values(permissions).filter(v => v).length;
        
        return `
            <div class="profile-card" style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                            <h3 style="margin: 0; font-size: 20px;">${this.escapeHtml(user.name)}</h3>
                            <span style="padding: 4px 12px; background: ${user.role === 'admin' ? '#fee2e2' : '#dbeafe'}; color: ${user.role === 'admin' ? '#991b1b' : '#1e40af'}; border-radius: 12px; font-size: 12px; font-weight: 600;">
                                ${user.role === 'admin' ? '👑 管理员' : '👤 用户'}
                            </span>
                        </div>
                        <div style="font-size: 14px; color: #64748b;">
                            学号: ${user.studentId} · ${user.grade} · ${user.level}
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-secondary btn-sm" onclick="app.viewUserProfile(${user.id})">查看详情</button>
                        <button class="btn btn-primary btn-sm" onclick="app.editUser(${user.id})">编辑</button>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
                    <div style="padding: 12px; background: #f8fafc; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: 700; color: #667eea; margin-bottom: 4px;">${total}</div>
                        <div style="font-size: 12px; color: #64748b;">总任务</div>
                    </div>
                    <div style="padding: 12px; background: #f8fafc; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: 700; color: #10b981; margin-bottom: 4px;">${completed}</div>
                        <div style="font-size: 12px; color: #64748b;">已完成</div>
                    </div>
                    <div style="padding: 12px; background: #f8fafc; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: 700; color: #f59e0b; margin-bottom: 4px;">${rate}%</div>
                        <div style="font-size: 12px; color: #64748b;">完成率</div>
                    </div>
                    <div style="padding: 12px; background: #f8fafc; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: 700; color: #8b5cf6; margin-bottom: 4px;">${totalHours.toFixed(1)}h</div>
                        <div style="font-size: 12px; color: #64748b;">累计工时</div>
                    </div>
                </div>
                
                <div style="padding: 12px; background: #f8fafc; border-radius: 8px;">
                    <div style="font-size: 13px; color: #64748b; margin-bottom: 4px;">权限配置</div>
                    <div style="font-size: 14px; font-weight: 600;">${permCount}/6 个权限</div>
                </div>
            </div>
        `;
    };
    
    // 查看用户详细信息
    TaskSystem.prototype.viewUserProfile = function(userId) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.id === userId);
        if (!user) return;
        
        const userTasks = this.tasks.filter(t => t.assigneeId === userId || t.userId === userId);
        const permissions = user.permissions || {};
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2>👤 ${this.escapeHtml(user.name)} 的详细信息</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div style="padding: 24px;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-bottom: 24px;">
                        <div>
                            <h3 style="font-size: 16px; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">基本信息</h3>
                            <div class="info-grid">
                                <div class="info-item">
                                    <div class="info-label">学号</div>
                                    <div class="info-value">${user.studentId}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">姓名</div>
                                    <div class="info-value">${user.name}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">角色</div>
                                    <div class="info-value">${user.role === 'admin' ? '👑 管理员' : '👤 用户'}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">年级</div>
                                    <div class="info-value">${user.grade}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">培养层次</div>
                                    <div class="info-value">${user.level}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">学校</div>
                                    <div class="info-value">${user.school}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">联系电话</div>
                                    <div class="info-value">${user.phone}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">电子邮件</div>
                                    <div class="info-value">${user.email || '未填写'}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h3 style="font-size: 16px; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">权限配置</h3>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                                ${Object.entries(permissions).map(([key, value]) => `
                                    <div style="display: flex; align-items: center; gap: 8px; padding: 12px; background: ${value ? '#d1fae5' : '#fee2e2'}; border-radius: 8px;">
                                        <span style="font-size: 18px;">${value ? '✅' : '❌'}</span>
                                        <span style="font-size: 14px; font-weight: 600;">${this.getPermissionName(key)}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <h3 style="font-size: 16px; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">任务统计</h3>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
                        <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; margin-bottom: 4px;">${userTasks.length}</div>
                            <div style="font-size: 14px; opacity: 0.9;">总任务数</div>
                        </div>
                        <div style="padding: 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 12px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; margin-bottom: 4px;">${userTasks.filter(t => t.status === 'completed').length}</div>
                            <div style="font-size: 14px; opacity: 0.9;">已完成</div>
                        </div>
                        <div style="padding: 20px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border-radius: 12px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; margin-bottom: 4px;">${userTasks.filter(t => t.status === 'in-progress').length}</div>
                            <div style="font-size: 14px; opacity: 0.9;">进行中</div>
                        </div>
                        <div style="padding: 20px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border-radius: 12px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; margin-bottom: 4px;">${userTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0).toFixed(1)}h</div>
                            <div style="font-size: 14px; opacity: 0.9;">累计工时</div>
                        </div>
                    </div>
                    
                    <h3 style="font-size: 16px; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">最近任务</h3>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${userTasks.slice(0, 10).map(task => `
                            <div style="padding: 12px; margin-bottom: 8px; background: #f8fafc; border-radius: 8px; cursor: pointer;" onclick="app.showTaskDetail(${task.id}); this.closest('.modal').remove();">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                    <strong>${this.escapeHtml(task.name)}</strong>
                                    <span style="font-size: 12px; color: #667eea;">${task.taskNumber}</span>
                                </div>
                                <div style="font-size: 13px; color: #64748b;">
                                    进度: ${task.progress || 0}% · 截止: ${task.deadline}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">关闭</button>
                    <button class="btn btn-primary" onclick="app.editUser(${userId}); this.closest('.modal').remove();">编辑用户</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };
    
    // 普通用户个人中心视图
    TaskSystem.prototype.renderUserProfileView = function() {
        const user = this.currentUser;
        const myTasks = this.tasks.filter(t => t.userId === user.id || t.assigneeId === user.id);
        const completed = myTasks.filter(t => t.status === 'completed').length;
        const totalHours = myTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
        
        const permissions = user.permissions || {};
        const permList = Object.entries(permissions)
            .filter(([key, value]) => value)
            .map(([key]) => this.getPermissionName(key))
            .join('、');
        
        // 生成直接登录链接
        const baseUrl = window.location.origin + window.location.pathname;
        const directUrl = `${baseUrl}?token=${user.token}`;
        
        const profilePage = document.getElementById('profile-page');
        profilePage.innerHTML = `
            <div class="page-header">
                <h1>个人中心</h1>
                ${user.role === 'admin' ? `
                    <button class="btn btn-primary" onclick="app.renderAdminProfileView()">查看所有人</button>
                ` : ''}
            </div>
            
            <div class="profile-grid">
                <div class="profile-card">
                    <h3>👤 基本信息</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">学号</div>
                            <div class="info-value">${user.studentId}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">姓名</div>
                            <div class="info-value">${user.name}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">年级</div>
                            <div class="info-value">${user.grade}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">学校</div>
                            <div class="info-value">${user.school}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">培养层次</div>
                            <div class="info-value">${user.level}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">联系电话</div>
                            <div class="info-value">${user.phone}</div>
                        </div>
                    </div>
                    <div style="margin-top: 16px; padding: 16px; background: #f8fafc; border-radius: 10px;">
                        <h4 style="font-size: 14px; margin-bottom: 8px; color: #667eea;">🔐 我的权限</h4>
                        <div style="font-size: 13px; line-height: 1.8;">${permList || '无'}</div>
                    </div>
                    <div style="margin-top: 16px; padding: 16px; background: #e0e7ff; border-radius: 10px;">
                        <h4 style="font-size: 14px; margin-bottom: 8px; color: #667eea;">🔗 直接登录链接</h4>
                        <p style="font-size: 12px; color: #64748b; margin-bottom: 8px;">复制此链接可直接登录系统</p>
                        <input type="text" value="${directUrl}" readonly 
                            style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; font-family: monospace;"
                            onclick="this.select(); document.execCommand('copy'); app.showToast('链接已复制！', 'success');">
                    </div>
                </div>

                <div class="profile-card">
                    <h3>🏆 成就系统</h3>
                    <div class="achievement-grid">
                        ${this.renderAchievements(completed, totalHours)}
                    </div>
                </div>

                <div class="profile-card">
                    <h3>📊 能力雷达图</h3>
                    ${this.renderAbilityRadar(myTasks)}
                </div>

                <div class="profile-card">
                    <h3>📅 活动日历</h3>
                    ${this.renderActivityCalendar(myTasks)}
                </div>
            </div>
        `;
    };
    
    // 渲染成就
    TaskSystem.prototype.renderAchievements = function(completed, totalHours) {
        const achievementList = [
            { icon: '🎯', name: '初出茅庐', desc: '完成首个任务', unlocked: completed >= 1 },
            { icon: '🏆', name: '勤奋学者', desc: '完成10个任务', unlocked: completed >= 10 },
            { icon: '⭐', name: '科研达人', desc: '完成50个任务', unlocked: completed >= 50 },
            { icon: '⏰', name: '时间管理', desc: '累计100小时', unlocked: totalHours >= 100 },
            { icon: '📚', name: '知识渊博', desc: '累计500小时', unlocked: totalHours >= 500 },
            { icon: '👑', name: '科研之星', desc: '完成100个任务', unlocked: completed >= 100 }
        ];
        
        return achievementList.map(a => `
            <div class="achievement-item ${a.unlocked ? '' : 'achievement-locked'}">
                <div class="achievement-icon">${a.icon}</div>
                <div class="achievement-name">${a.name}</div>
                <div class="achievement-desc">${a.desc}</div>
            </div>
        `).join('');
    };
    
    // 渲染能力雷达
    TaskSystem.prototype.renderAbilityRadar = function(myTasks) {
        const typeCount = {};
        myTasks.forEach(t => {
            if (!typeCount[t.type]) typeCount[t.type] = 0;
            typeCount[t.type]++;
        });
        
        return `
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
    };
    
    // 渲染活动日历
    TaskSystem.prototype.renderActivityCalendar = function(myTasks) {
        const recentActivity = myTasks
            .filter(t => t.completeTime)
            .sort((a, b) => b.completeTime - a.completeTime)
            .slice(0, 10);
        
        return `
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
    };
    
    // 搜索用户
    TaskSystem.prototype.searchProfileUsers = function() {
        const searchEl = document.getElementById('profile-search');
        if (!searchEl) return;
        
        const keyword = searchEl.value.toLowerCase();
        const cards = document.querySelectorAll('#all-users-list .profile-card');
        
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(keyword) ? '' : 'none';
        });
    };
    
    // 筛选用户
    TaskSystem.prototype.filterProfileUsers = function() {
        const filterEl = document.getElementById('profile-role-filter');
        if (!filterEl) return;
        
        const role = filterEl.value;
        const cards = document.querySelectorAll('#all-users-list .profile-card');
        
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
    
    console.log('✅ 个人中心增强已加载');
})();

