// 管理员控制台 - JavaScript

class AdminSystem {
    constructor() {
        this.currentAdmin = null;
        this.users = [];
        this.currentEditUserId = null;
        this.init();
    }

    init() {
        // 检查管理员登录
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) {
            alert('请先登录！');
            window.location.href = 'neuro-simple.html';
            return;
        }

        this.currentAdmin = JSON.parse(userStr);
        
        // 检查是否是管理员
        if (this.currentAdmin.role !== 'admin') {
            alert('您没有管理员权限！');
            window.location.href = 'advanced-system.html';
            return;
        }

        // 加载用户数据
        this.loadUsers();
        
        // 设置事件监听
        this.setupEvents();
        
        // 更新界面
        this.updateUI();
    }

    loadUsers() {
        this.users = JSON.parse(localStorage.getItem('users') || '[]');
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    setupEvents() {
        // 导航
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.dataset.page) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showPage(link.dataset.page);
                });
            }
        });
    }

    updateUI() {
        document.getElementById('admin-name').textContent = this.currentAdmin.name;
        
        // 更新统计
        const totalUsers = this.users.length;
        const adminCount = this.users.filter(u => u.role === 'admin').length;
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const newUsers = this.users.filter(u => u.registerTime > weekAgo).length;
        
        document.getElementById('total-users').textContent = totalUsers;
        document.getElementById('admin-count').textContent = adminCount;
        document.getElementById('active-users').textContent = totalUsers;
        document.getElementById('new-users').textContent = newUsers;
        
        // 渲染用户列表
        this.renderUsers();
    }

    renderUsers() {
        const tbody = document.getElementById('users-tbody');
        
        if (this.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#64748b;">暂无用户</td></tr>';
            return;
        }

        tbody.innerHTML = this.users.map(user => {
            const permissions = user.permissions || {};
            const permCount = Object.values(permissions).filter(v => v).length;
            
            return `
                <tr>
                    <td><strong>${this.escapeHtml(user.studentId)}</strong></td>
                    <td>${this.escapeHtml(user.name)}</td>
                    <td>
                        <span class="role-badge ${user.role === 'admin' ? 'role-admin' : 'role-user'}">
                            ${user.role === 'admin' ? '👑 管理员' : '👤 用户'}
                        </span>
                    </td>
                    <td>${user.grade || '-'}</td>
                    <td>
                        <div class="permission-dots" title="${permCount}/6 个权限">
                            ${this.renderPermissionDots(permissions)}
                        </div>
                    </td>
                    <td>${new Date(user.registerTime).toLocaleDateString()}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-secondary btn-icon" onclick="admin.editUser(${user.id})">编辑</button>
                            <button class="btn btn-secondary btn-icon" onclick="admin.viewUserLink(${user.id})">链接</button>
                            ${user.id !== this.currentAdmin.id ? 
                                `<button class="btn btn-secondary btn-icon" onclick="admin.deleteUser(${user.id})" style="background:#ef4444;color:white;">删除</button>` 
                                : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderPermissionDots(permissions) {
        const permKeys = ['create', 'edit', 'delete', 'view', 'analytics', 'export'];
        return permKeys.map(key => 
            `<div class="permission-dot ${permissions[key] ? '' : 'disabled'}" title="${this.getPermissionName(key)}"></div>`
        ).join('');
    }

    getPermissionName(key) {
        const names = {
            create: '创建',
            edit: '编辑',
            delete: '删除',
            view: '查看',
            analytics: '分析',
            export: '导出'
        };
        return names[key] || key;
    }

    showPage(pageName) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === pageName) {
                link.classList.add('active');
            }
        });

        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageName + '-page').classList.add('active');
    }

    showAddUserModal() {
        this.currentEditUserId = null;
        document.getElementById('user-modal-title').textContent = '添加用户';
        document.getElementById('user-form').reset();
        document.getElementById('user-role').value = 'user';
        this.updatePermissionsByRole();
        document.getElementById('user-modal').classList.add('show');
    }

    editUser(userId) {
        const user = this.users.find(u => u.id === userId);
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
    }

    saveUser(event) {
        event.preventDefault();

        const studentId = document.getElementById('user-studentId').value.trim();
        const name = document.getElementById('user-name').value.trim();
        const role = document.getElementById('user-role').value;
        const grade = document.getElementById('user-grade').value;
        const level = document.getElementById('user-level').value;
        const school = document.getElementById('user-school').value.trim();
        const phone = document.getElementById('user-phone').value.trim();
        const email = document.getElementById('user-email').value.trim();
        const password = document.getElementById('user-password').value;

        const permissions = {
            create: document.getElementById('user-perm-create').checked,
            edit: document.getElementById('user-perm-edit').checked,
            delete: document.getElementById('user-perm-delete').checked,
            view: document.getElementById('user-perm-view').checked,
            analytics: document.getElementById('user-perm-analytics').checked,
            export: document.getElementById('user-perm-export').checked
        };

        if (this.currentEditUserId) {
            // 编辑现有用户
            const user = this.users.find(u => u.id === this.currentEditUserId);
            if (user) {
                user.name = name;
                user.role = role;
                user.grade = grade;
                user.level = level;
                user.school = school;
                user.phone = phone;
                user.email = email;
                user.password = password;
                user.permissions = permissions;
                
                this.showToast('用户信息已更新！', 'success');
            }
        } else {
            // 添加新用户
            // 检查学号是否已存在
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
    }

    deleteUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        if (confirm(`确定要删除用户"${user.name}"吗？此操作不可恢复！`)) {
            this.users = this.users.filter(u => u.id !== userId);
            this.saveUsers();
            this.showToast('用户已删除！', 'success');
            this.updateUI();
        }
    }

    viewUserLink(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const baseUrl = window.location.origin + window.location.pathname.replace('admin.html', 'advanced-system.html');
        const directUrl = `${baseUrl}?token=${user.token}`;

        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>用户访问链接</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div style="padding: 24px;">
                    <p style="margin-bottom: 16px;"><strong>用户：</strong>${this.escapeHtml(user.name)} (${user.studentId})</p>
                    <p style="margin-bottom: 8px;"><strong>直接登录链接：</strong></p>
                    <input type="text" value="${directUrl}" readonly 
                        style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-family: monospace; font-size: 13px;"
                        onclick="this.select(); document.execCommand('copy'); admin.showToast('链接已复制！', 'success');">
                    <p style="margin-top: 16px; font-size: 13px; color: #64748b;">
                        💡 将此链接发送给用户，用户点击即可直接登录，无需输入密码。
                    </p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">关闭</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    updatePermissionsByRole() {
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
    }

    applyTemplate(templateName) {
        this.showToast('请先选择要应用模板的用户（功能开发中）', 'error');
    }

    searchUsers() {
        const keyword = document.getElementById('search-input').value.toLowerCase();
        const rows = document.querySelectorAll('#users-tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(keyword) ? '' : 'none';
        });
    }

    filterUsers() {
        const role = document.getElementById('role-filter').value;
        const rows = document.querySelectorAll('#users-tbody tr');
        
        rows.forEach(row => {
            if (role === 'all') {
                row.style.display = '';
            } else {
                const isAdmin = row.textContent.includes('管理员');
                const shouldShow = (role === 'admin' && isAdmin) || (role === 'user' && !isAdmin);
                row.style.display = shouldShow ? '' : 'none';
            }
        });
    }

    generateToken(studentId) {
        return btoa(studentId + ':' + Date.now());
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = 'toast show ' + type;
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

function logout() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'neuro-simple.html';
    }
}

function showAddUserModal() {
    admin.showAddUserModal();
}

function closeModal(modalId) {
    admin.closeModal(modalId);
}

function saveUser(event) {
    admin.saveUser(event);
}

function updatePermissionsByRole() {
    admin.updatePermissionsByRole();
}

function searchUsers() {
    admin.searchUsers();
}

function filterUsers() {
    admin.filterUsers();
}

function applyTemplate(templateName) {
    admin.applyTemplate(templateName);
}

// 初始化管理员系统
const admin = new AdminSystem();

