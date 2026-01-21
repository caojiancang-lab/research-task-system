// V2.7.1 修复和改进脚本
// 修复权限设置、人员任务显示、添加新管理员

(function() {
    console.log('🔧 加载 V2.7.1 修复脚本...');
    
    // ==================== 1. 修复用户角色和权限设置 ====================
    
    // 重写管理员系统的权限设置
    if (typeof AdminSystem !== 'undefined') {
        // 修改默认权限设置
        AdminSystem.prototype.updatePermissionsByRole = function() {
            const role = document.getElementById('user-role');
            if (!role) return;
            
            // 强制设置为普通用户
            role.value = 'user';
            role.disabled = true; // 禁用角色选择
            
            // 普通用户：可以查看、创建和编辑科研进展
            document.getElementById('user-perm-create').checked = true;  // 可以创建（科研进展）
            document.getElementById('user-perm-edit').checked = true;    // 可以编辑（科研进展）
            document.getElementById('user-perm-delete').checked = false;
            document.getElementById('user-perm-view').checked = true;    // 可以查看
            document.getElementById('user-perm-analytics').checked = false;
            document.getElementById('user-perm-export').checked = false;
        };
        
        // 修改添加用户模态框
        const originalShowAddUserModal = AdminSystem.prototype.showAddUserModal;
        AdminSystem.prototype.showAddUserModal = function() {
            if (originalShowAddUserModal) {
                originalShowAddUserModal.call(this);
            }
            
            // 强制设置为普通用户
            setTimeout(() => {
                const roleSelect = document.getElementById('user-role');
                if (roleSelect) {
                    roleSelect.value = 'user';
                    roleSelect.disabled = true;
                    
                    // 隐藏角色选择行
                    const roleGroup = roleSelect.closest('.form-group');
                    if (roleGroup) {
                        roleGroup.style.display = 'none';
                    }
                }
                
                // 设置默认权限
                this.updatePermissionsByRole();
            }, 50);
        };
        
        // 修改保存用户逻辑
        const originalSaveUser = AdminSystem.prototype.saveUser;
        AdminSystem.prototype.saveUser = function(event) {
            event.preventDefault();
            
            const studentId = document.getElementById('user-studentId').value.trim();
            const name = document.getElementById('user-name').value.trim();
            const grade = document.getElementById('user-grade').value;
            const level = document.getElementById('user-level').value;
            const school = document.getElementById('user-school').value.trim();
            const phone = document.getElementById('user-phone').value.trim();
            const email = document.getElementById('user-email').value.trim();
            const password = document.getElementById('user-password').value;
            
            // 强制设置为普通用户，默认有查看、编辑和创建科研进展权限
            const role = 'user';
            const permissions = {
                create: true,  // 可以创建任务（限制为科研进展）
                edit: true,    // 可以编辑科研进展
                delete: false,
                view: true,    // 可以查看任务
                analytics: false,
                export: false
            };
            
            if (this.currentEditUserId) {
                // 编辑现有用户
                const user = this.users.find(u => u.id === this.currentEditUserId);
                if (user) {
                    user.name = name;
                    user.grade = grade;
                    user.level = level;
                    user.school = school;
                    user.phone = phone;
                    user.email = email;
                    user.password = password;
                    // 不修改角色和权限（保持原有设置）
                    
                    this.showToast('用户信息已更新！', 'success');
                }
            } else {
                // 添加新用户
                if (this.users.find(u => u.studentId === studentId)) {
                    this.showToast('该学号已存在！', 'error');
                    return;
                }
                
                const newUser = {
                    id: Date.now(),
                    studentId,
                    name,
                    role,
                    grade,
                    level,
                    school,
                    phone,
                    email,
                    password,
                    token: this.generateToken(studentId),
                    permissions,
                    registerTime: Date.now()
                };
                
                this.users.push(newUser);
                this.showToast('用户添加成功！', 'success');
            }
            
            this.saveUsers();
            this.closeModal('user-modal');
            this.updateUI();
        };
    }
    
    // ==================== 2. 修复人员任务显示问题 ====================
    
    // 修复 filterUserTasks 方法，过滤已删除的任务
    if (typeof TaskSystem !== 'undefined') {
        TaskSystem.prototype.filterUserTasks = function() {
            const userFilter = document.getElementById('user-task-filter');
            const statusFilter = document.getElementById('user-task-status-filter');
            const listContainer = document.getElementById('user-tasks-list');
            
            if (!userFilter || !statusFilter || !listContainer) return;
            
            const selectedUserId = userFilter.value;
            const selectedStatus = statusFilter.value;
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // 过滤任务：排除已删除的任务
            let filteredTasks = this.tasks.filter(t => t && t.id); // 确保任务存在且有ID
            
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
                                const status = statusMap[task.status] || { text: task.status, class: 'badge-planning' };
                                
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
                                            <span>⏱️ ${task.actualHours || 0}/${task.estimatedHours || 0}h</span>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }).join('');
        };
        
        // 清理任务数据，移除无效任务
        TaskSystem.prototype.cleanupTasks = function() {
            const validTasks = this.tasks.filter(t => t && t.id && t.name);
            if (validTasks.length !== this.tasks.length) {
                this.tasks = validTasks;
                this.saveData();
                console.log(`✅ 清理了 ${this.tasks.length - validTasks.length} 个无效任务`);
            }
        };
    }
    
    // ==================== 3. 添加新管理员账号 ====================
    
    function addNewAdmin() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // 检查账号是否已存在
        const existingUser = users.find(u => u.studentId === '18109316679');
        if (existingUser) {
            console.log('⚠️ 管理员账号已存在');
            return;
        }
        
        // 创建新管理员
        const newAdmin = {
            id: Date.now(),
            studentId: '18109316679',
            name: '管理员',
            role: 'admin',
            grade: '2024级',
            level: '博士研究生',
            school: '神经精神亚专业',
            phone: '18109316679',
            email: '',
            password: 'zxcvbnm9988@',
            token: btoa('18109316679:' + Date.now()),
            permissions: {
                create: true,
                edit: true,
                delete: true,
                view: true,
                analytics: true,
                export: true
            },
            registerTime: Date.now()
        };
        
        users.push(newAdmin);
        localStorage.setItem('users', JSON.stringify(users));
        
        console.log('✅ 新管理员账号已添加');
        console.log('   账号：18109316679');
        console.log('   密码：zxcvbnm9988@');
    }
    
    // ==================== 4. 限制科研进展创建和编辑权限 ====================
    
    // 普通用户只能创建和编辑科研进展类型的任务
    if (typeof TaskSystem !== 'undefined') {
        const originalShowTaskModal = TaskSystem.prototype.showTaskModal;
        TaskSystem.prototype.showTaskModal = function(taskId) {
            const isAdmin = this.currentUser.role === 'admin';
            const hasCreatePerm = this.currentUser.permissions && this.currentUser.permissions.create;
            const hasEditPerm = this.currentUser.permissions && this.currentUser.permissions.edit;
            
            if (taskId) {
                // 编辑任务
                const task = this.tasks.find(t => t.id === taskId);
                if (task) {
                    if (!isAdmin && hasEditPerm) {
                        // 普通用户只能编辑科研进展类型的任务
                        if (task.type !== '科研进展') {
                            this.showToast('您只能编辑科研进展类型的任务！', 'error');
                            return;
                        }
                    }
                }
            } else {
                // 创建任务
                if (!isAdmin && hasCreatePerm) {
                    // 普通用户创建任务时，限制任务类型为科研进展
                    if (originalShowTaskModal) {
                        originalShowTaskModal.call(this, taskId);
                    }
                    
                    // 延迟执行，等待模态框渲染完成
                    setTimeout(() => {
                        const taskTypeSelect = document.getElementById('task-type');
                        if (taskTypeSelect) {
                            // 强制设置为科研进展
                            taskTypeSelect.value = '科研进展';
                            taskTypeSelect.disabled = true;
                            
                            // 触发自动填充
                            if (this.applyResearchProgressSettings) {
                                this.applyResearchProgressSettings();
                            }
                        }
                    }, 100);
                    return;
                }
            }
            
            if (originalShowTaskModal) {
                originalShowTaskModal.call(this, taskId);
            }
        };
        
        // 保存任务时验证类型
        const originalSaveTask = TaskSystem.prototype.saveTask;
        TaskSystem.prototype.saveTask = function(event) {
            if (event) event.preventDefault();
            
            const isAdmin = this.currentUser.role === 'admin';
            const taskTypeSelect = document.getElementById('task-type');
            
            if (!isAdmin && taskTypeSelect) {
                const taskType = taskTypeSelect.value;
                // 检查是否有创建其他类型的权限
                const hasFullCreatePerm = this.currentUser.permissions && 
                                         this.currentUser.permissions.createOtherTypes;
                
                if (!hasFullCreatePerm && taskType !== '科研进展') {
                    this.showToast('您只能创建科研进展类型的任务！', 'error');
                    return;
                }
            }
            
            if (originalSaveTask) {
                originalSaveTask.call(this, event);
            }
        };
    }
    
    // ==================== 5. 初始化 ====================
    
    function initV271Fixes() {
        // 添加新管理员
        addNewAdmin();
        
        // 清理无效任务
        if (typeof app !== 'undefined' && app.cleanupTasks) {
            app.cleanupTasks();
        }
        
        console.log('✅ V2.7.1 修复脚本初始化完成');
        console.log('   - 用户角色固定为普通用户');
        console.log('   - 权限限制为查看和编辑科研进展');
        console.log('   - 人员任务显示已修复');
        console.log('   - 新管理员账号已添加');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initV271Fixes);
    } else {
        initV271Fixes();
    }
    
})();

