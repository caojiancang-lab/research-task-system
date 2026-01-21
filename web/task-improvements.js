// 任务改进脚本 - 修复编号、添加科研进展类型、实现排序功能
// 在所有其他脚本之后加载

(function() {
    console.log('🔧 加载任务改进脚本...');
    
    // ==================== 1. 修复任务编号问题 ====================
    
    // 获取下一个可用的任务编号（确保连续）
    TaskSystem.prototype.getNextTaskNumber = function() {
        if (!this.tasks || this.tasks.length === 0) {
            return '任务001';
        }
        
        // 提取所有现有编号
        const existingNumbers = this.tasks
            .map(t => t.taskNumber)
            .filter(n => n && n.startsWith('任务'))
            .map(n => {
                const match = n.match(/任务(\d+)/);
                return match ? parseInt(match[1]) : 0;
            })
            .filter(n => n > 0)
            .sort((a, b) => a - b);
        
        if (existingNumbers.length === 0) {
            return '任务001';
        }
        
        // 找到第一个缺失的编号
        for (let i = 1; i <= existingNumbers.length; i++) {
            if (!existingNumbers.includes(i)) {
                return `任务${String(i).padStart(3, '0')}`;
            }
        }
        
        // 如果没有缺失，返回下一个编号
        const maxNumber = Math.max(...existingNumbers);
        return `任务${String(maxNumber + 1).padStart(3, '0')}`;
    };
    
    // 重写 showTaskModal 以使用新的编号生成逻辑
    const originalShowTaskModal = TaskSystem.prototype.showTaskModal;
    TaskSystem.prototype.showTaskModal = function(taskId) {
        if (originalShowTaskModal) {
            originalShowTaskModal.call(this, taskId);
        }
        
        // 如果是创建新任务（不是编辑），设置任务编号
        if (!taskId) {
            const taskNumberEl = document.getElementById('task-number');
            if (taskNumberEl) {
                taskNumberEl.value = this.getNextTaskNumber();
            }
        }
    };
    
    // ==================== 2. 添加科研进展类型及自动设置 ====================
    
    // 科研进展的自动设置配置
    const researchProgressConfig = {
        name: '科研进展汇报',
        priority: '高',
        estimatedHours: 4,
        description: '定期汇报科研进展情况，包括：\n1. 本周期完成的工作内容\n2. 遇到的问题和解决方案\n3. 下周期工作计划\n4. 需要的支持和资源',
        steps: [
            '整理本周期工作内容',
            '总结遇到的问题',
            '制定下周期计划',
            '准备汇报材料',
            '进行进展汇报'
        ]
    };
    
    // 监听任务类型变化
    TaskSystem.prototype.setupTaskTypeListener = function() {
        const taskTypeSelect = document.getElementById('task-type');
        if (!taskTypeSelect) return;
        
        // 移除旧的监听器
        const newSelect = taskTypeSelect.cloneNode(true);
        taskTypeSelect.parentNode.replaceChild(newSelect, taskTypeSelect);
        
        // 添加新的监听器
        newSelect.addEventListener('change', (e) => {
            if (e.target.value === '科研进展') {
                this.applyResearchProgressSettings();
            }
        });
    };
    
    // 应用科研进展的自动设置
    TaskSystem.prototype.applyResearchProgressSettings = function() {
        // 设置任务名称
        const taskNameEl = document.getElementById('task-name');
        if (taskNameEl && !taskNameEl.value) {
            taskNameEl.value = researchProgressConfig.name;
        }
        
        // 设置优先级
        const priorityEl = document.getElementById('task-priority');
        if (priorityEl) {
            priorityEl.value = researchProgressConfig.priority;
        }
        
        // 设置预估工时
        const hoursEl = document.getElementById('task-hours');
        if (hoursEl && !hoursEl.value) {
            hoursEl.value = researchProgressConfig.estimatedHours;
        }
        
        // 设置描述
        const descEl = document.getElementById('task-desc');
        if (descEl && !descEl.value) {
            descEl.value = researchProgressConfig.description;
        }
        
        // 设置步骤
        const stepsEl = document.getElementById('task-steps');
        if (stepsEl && !stepsEl.value) {
            stepsEl.value = researchProgressConfig.steps.join('\n');
        }
        
        // 设置截止日期为7天后
        const deadlineEl = document.getElementById('task-deadline');
        if (deadlineEl) {
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + 7);
            deadlineEl.value = deadline.toISOString().split('T')[0];
        }
        
        this.showToast('已自动填充科研进展相关设置！', 'success');
    };
    
    // 在任务类型选择器中添加"科研进展"选项
    TaskSystem.prototype.addResearchProgressOption = function() {
        const taskTypeSelect = document.getElementById('task-type');
        if (!taskTypeSelect) return;
        
        // 检查是否已存在
        const existingOption = Array.from(taskTypeSelect.options).find(opt => opt.value === '科研进展');
        if (existingOption) return;
        
        // 添加选项
        const option = document.createElement('option');
        option.value = '科研进展';
        option.textContent = '科研进展';
        taskTypeSelect.appendChild(option);
    };
    
    // ==================== 3. 任务排序功能 ====================
    
    // 当前排序状态
    TaskSystem.prototype.currentSort = {
        field: 'createTime', // taskNumber, assigneeName, assignerName, createTime, deadline
        order: 'desc' // asc, desc
    };
    
    // 添加排序控制UI
    TaskSystem.prototype.addSortControls = function() {
        const tasksPage = document.getElementById('tasks-page');
        if (!tasksPage) return;
        
        const pageHeader = tasksPage.querySelector('.page-header');
        if (!pageHeader) return;
        
        // 检查是否已存在排序控件
        if (document.getElementById('task-sort-controls')) return;
        
        const sortControls = document.createElement('div');
        sortControls.id = 'task-sort-controls';
        sortControls.style.cssText = 'display: flex; align-items: center; gap: 12px;';
        
        sortControls.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; background: white; padding: 8px 16px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <span style="font-size: 14px; color: #64748b; font-weight: 500;">排序：</span>
                <select id="sort-field" style="border: none; background: transparent; font-size: 14px; color: #1e293b; font-weight: 500; cursor: pointer; outline: none;">
                    <option value="createTime">创建时间</option>
                    <option value="taskNumber">任务编号</option>
                    <option value="assigneeName">接收人</option>
                    <option value="assignerName">分派人</option>
                    <option value="deadline">截止日期</option>
                    <option value="priority">优先级</option>
                    <option value="status">状态</option>
                </select>
                <button id="sort-order-btn" style="border: none; background: transparent; cursor: pointer; font-size: 18px; padding: 4px; display: flex; align-items: center; transition: transform 0.3s;" title="切换排序方向">
                    ⬇️
                </button>
            </div>
        `;
        
        // 插入到页面标题和创建按钮之间
        const createBtn = pageHeader.querySelector('.btn-primary');
        if (createBtn) {
            pageHeader.insertBefore(sortControls, createBtn);
        } else {
            pageHeader.appendChild(sortControls);
        }
        
        // 绑定事件
        const sortFieldSelect = document.getElementById('sort-field');
        const sortOrderBtn = document.getElementById('sort-order-btn');
        
        if (sortFieldSelect) {
            sortFieldSelect.addEventListener('change', (e) => {
                this.currentSort.field = e.target.value;
                this.renderTasks();
            });
        }
        
        if (sortOrderBtn) {
            sortOrderBtn.addEventListener('click', () => {
                this.currentSort.order = this.currentSort.order === 'asc' ? 'desc' : 'asc';
                sortOrderBtn.textContent = this.currentSort.order === 'asc' ? '⬆️' : '⬇️';
                sortOrderBtn.style.transform = this.currentSort.order === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)';
                this.renderTasks();
            });
        }
    };
    
    // 排序任务列表
    TaskSystem.prototype.sortTasks = function(tasks) {
        const field = this.currentSort.field;
        const order = this.currentSort.order;
        
        const sorted = [...tasks].sort((a, b) => {
            let aVal, bVal;
            
            switch(field) {
                case 'taskNumber':
                    // 提取数字进行比较
                    aVal = parseInt((a.taskNumber || '').replace(/\D/g, '')) || 0;
                    bVal = parseInt((b.taskNumber || '').replace(/\D/g, '')) || 0;
                    break;
                    
                case 'assigneeName':
                    aVal = (a.assigneeName || '').toLowerCase();
                    bVal = (b.assigneeName || '').toLowerCase();
                    break;
                    
                case 'assignerName':
                    aVal = (a.assignerName || '').toLowerCase();
                    bVal = (b.assignerName || '').toLowerCase();
                    break;
                    
                case 'deadline':
                    aVal = new Date(a.deadline || 0).getTime();
                    bVal = new Date(b.deadline || 0).getTime();
                    break;
                    
                case 'createTime':
                    aVal = a.createTime || 0;
                    bVal = b.createTime || 0;
                    break;
                    
                case 'priority':
                    const priorityMap = { '高': 3, '中': 2, '低': 1 };
                    aVal = priorityMap[a.priority] || 0;
                    bVal = priorityMap[b.priority] || 0;
                    break;
                    
                case 'status':
                    const statusMap = { 
                        'planning': 1, 
                        'mid-check': 2,
                        'in-progress': 3, 
                        'paused': 4,
                        'review': 5, 
                        'acceptance': 6,
                        'quality-check': 7,
                        'not-qualified': 8,
                        'revision': 9,
                        'completed': 10,
                        'cancelled': 11
                    };
                    aVal = statusMap[a.status] || 0;
                    bVal = statusMap[b.status] || 0;
                    break;
                    
                default:
                    aVal = a[field] || '';
                    bVal = b[field] || '';
            }
            
            // 比较
            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });
        
        return sorted;
    };
    
    // 增强 renderTasks 方法以支持排序
    const originalRenderTasks = TaskSystem.prototype.renderTasks;
    TaskSystem.prototype.renderTasks = function() {
        const container = document.getElementById('tasks-container');
        if (!container) return;
        
        // 获取任务列表
        let myTasks = this.tasks.filter(t => 
            t.userId === this.currentUser.id || 
            t.assigneeId === this.currentUser.id ||
            t.assignerId === this.currentUser.id
        );
        
        // 应用过滤
        if (this.currentFilter !== 'all') {
            myTasks = myTasks.filter(t => t.status === this.currentFilter);
        }
        
        // 应用排序
        myTasks = this.sortTasks(myTasks);
        
        if (myTasks.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>暂无任务</p></div>';
            return;
        }
        
        // 渲染任务卡片
        container.innerHTML = myTasks.map(task => this.renderTaskCard(task)).join('');
    };
    
    // ==================== 4. 初始化增强功能 ====================
    
    // 增强 showPage 方法
    const originalShowPage = TaskSystem.prototype.showPage;
    TaskSystem.prototype.showPage = function(pageName) {
        if (originalShowPage) {
            originalShowPage.call(this, pageName);
        }
        
        if (pageName === 'tasks') {
            // 添加排序控件
            setTimeout(() => {
                this.addSortControls();
            }, 100);
        }
    };
    
    // 增强模态框显示
    const originalShowTaskModalEnhanced = TaskSystem.prototype.showTaskModal;
    TaskSystem.prototype.showTaskModal = function(taskId) {
        if (originalShowTaskModalEnhanced) {
            originalShowTaskModalEnhanced.call(this, taskId);
        }
        
        // 添加科研进展选项
        setTimeout(() => {
            this.addResearchProgressOption();
            this.setupTaskTypeListener();
        }, 50);
    };
    
    // ==================== 5. 页面加载时初始化 ====================
    
    // 等待 app 对象初始化
    function initEnhancements() {
        if (typeof app !== 'undefined' && app.tasks) {
            // 添加排序控件
            if (document.getElementById('tasks-page')) {
                app.addSortControls();
            }
            
            console.log('✅ 任务改进脚本初始化完成');
            console.log('   - 任务编号自动连续');
            console.log('   - 科研进展类型已添加');
            console.log('   - 排序功能已启用');
        } else {
            setTimeout(initEnhancements, 100);
        }
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEnhancements);
    } else {
        initEnhancements();
    }
    
})();


