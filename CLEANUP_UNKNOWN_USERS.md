# 删除未知用户任务指南

## 🎯 问题说明

系统中可能存在一些"未知用户"的任务，这些任务的创建者或接收人已经不在用户列表中，导致显示为"未知用户"。

---

## 🧹 清理方法

### 方法1：使用清理脚本（推荐）

**步骤**：
1. 打开系统页面（`advanced-system.html`）
2. 按 `F12` 打开浏览器开发者工具
3. 切换到 `Console`（控制台）标签
4. 复制以下代码并粘贴到控制台：

```javascript
(function() {
    console.log('🧹 开始清理未知用户的任务...');
    
    // 获取所有用户
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const validUserIds = users.map(u => u.id);
    
    // 获取所有任务
    const tasks = JSON.parse(localStorage.getItem('tasks_data') || '[]');
    console.log(`当前任务总数: ${tasks.length}`);
    
    // 筛选出未知用户的任务
    const unknownUserTasks = tasks.filter(task => {
        const userId = task.userId || task.assigneeId || task.assignerId;
        return userId && !validUserIds.includes(userId);
    });
    
    console.log(`未知用户任务数量: ${unknownUserTasks.length}`);
    
    if (unknownUserTasks.length > 0) {
        // 删除未知用户的任务
        const validTasks = tasks.filter(task => {
            const userId = task.userId || task.assigneeId || task.assignerId;
            return !userId || validUserIds.includes(userId);
        });
        
        // 保存清理后的任务
        localStorage.setItem('tasks_data', JSON.stringify(validTasks));
        
        // 清理相关周计划
        const weeklyPlans = JSON.parse(localStorage.getItem('weekly_plans') || '[]');
        const deletedTaskIds = unknownUserTasks.map(t => t.id);
        const validPlans = weeklyPlans.filter(plan => !deletedTaskIds.includes(plan.taskId));
        localStorage.setItem('weekly_plans', JSON.stringify(validPlans));
        
        console.log(`✅ 已删除 ${unknownUserTasks.length} 个未知用户任务`);
        alert(`清理完成！已删除 ${unknownUserTasks.length} 个未知用户任务`);
        location.reload();
    } else {
        console.log('✅ 没有发现未知用户的任务');
        alert('没有发现未知用户的任务，无需清理');
    }
})();
```

5. 按 `Enter` 运行
6. 查看控制台输出的清理结果
7. 页面会自动刷新

---

### 方法2：手动清理

**步骤**：
1. 打开浏览器控制台（F12）
2. 运行以下代码查看未知用户任务：

```javascript
// 查看所有任务
const tasks = JSON.parse(localStorage.getItem('tasks_data') || '[]');
const users = JSON.parse(localStorage.getItem('users') || '[]');
const validUserIds = users.map(u => u.id);

tasks.forEach((task, index) => {
    const userId = task.userId || task.assigneeId;
    if (userId && !validUserIds.includes(userId)) {
        console.log(`${index}. ${task.name} - 未知用户 (ID: ${userId})`);
    }
});
```

3. 如果发现未知用户任务，运行清理代码：

```javascript
// 删除未知用户任务
const tasks = JSON.parse(localStorage.getItem('tasks_data') || '[]');
const users = JSON.parse(localStorage.getItem('users') || '[]');
const validUserIds = users.map(u => u.id);

const validTasks = tasks.filter(task => {
    const userId = task.userId || task.assigneeId || task.assignerId;
    return !userId || validUserIds.includes(userId);
});

localStorage.setItem('tasks_data', JSON.stringify(validTasks));
console.log(`已删除 ${tasks.length - validTasks.length} 个未知用户任务`);
location.reload();
```

---

### 方法3：清空所有任务（彻底清理）

如果想要彻底清空所有任务，重新开始：

```javascript
// 清空所有任务和周计划
localStorage.setItem('tasks_data', '[]');
localStorage.setItem('weekly_plans', '[]');
console.log('✅ 所有任务已清空');
location.reload();
```

---

## 🔍 清理前检查

在清理前，可以先查看有哪些未知用户任务：

```javascript
// 查看未知用户任务详情
const tasks = JSON.parse(localStorage.getItem('tasks_data') || '[]');
const users = JSON.parse(localStorage.getItem('users') || '[]');
const validUserIds = users.map(u => u.id);

console.log('=== 未知用户任务列表 ===');
tasks.forEach(task => {
    const userId = task.userId || task.assigneeId;
    if (userId && !validUserIds.includes(userId)) {
        console.log(`任务: ${task.name}`);
        console.log(`  ID: ${task.id}`);
        console.log(`  用户ID: ${userId}`);
        console.log(`  状态: ${task.status}`);
        console.log(`  创建时间: ${new Date(task.createTime).toLocaleString()}`);
        console.log('---');
    }
});
```

---

## ⚠️ 注意事项

1. **备份数据**：清理前建议先备份数据
2. **不可恢复**：删除操作不可恢复，请谨慎操作
3. **关联数据**：会同时清理相关的周计划数据
4. **刷新页面**：清理后需要刷新页面才能看到效果

---

## 📊 清理后验证

清理完成后，可以运行以下代码验证：

```javascript
// 验证是否还有未知用户任务
const tasks = JSON.parse(localStorage.getItem('tasks_data') || '[]');
const users = JSON.parse(localStorage.getItem('users') || '[]');
const validUserIds = users.map(u => u.id);

const unknownTasks = tasks.filter(task => {
    const userId = task.userId || task.assigneeId;
    return userId && !validUserIds.includes(userId);
});

if (unknownTasks.length === 0) {
    console.log('✅ 验证通过：没有未知用户任务');
} else {
    console.log(`⚠️ 还有 ${unknownTasks.length} 个未知用户任务`);
}
```

---

## 🎯 常见问题

**Q1：为什么会出现未知用户？**  
A：可能是因为删除了用户，但没有删除该用户的任务。

**Q2：清理会影响其他用户的任务吗？**  
A：不会，只会删除未知用户的任务，有效用户的任务会保留。

**Q3：可以恢复被删除的任务吗？**  
A：不可以，删除操作不可恢复。建议清理前先备份数据。

**Q4：清理后需要重新登录吗？**  
A：不需要，只是删除任务数据，不影响登录状态。

---

## 🚀 快速清理（一键执行）

复制以下完整代码到控制台，一键清理：

```javascript
(function(){const users=JSON.parse(localStorage.getItem('users')||'[]');const validUserIds=users.map(u=>u.id);const tasks=JSON.parse(localStorage.getItem('tasks_data')||'[]');const validTasks=tasks.filter(task=>{const userId=task.userId||task.assigneeId||task.assignerId;return!userId||validUserIds.includes(userId);});const deleted=tasks.length-validTasks.length;if(deleted>0){localStorage.setItem('tasks_data',JSON.stringify(validTasks));const weeklyPlans=JSON.parse(localStorage.getItem('weekly_plans')||'[]');const deletedTaskIds=tasks.filter(t=>!validTasks.includes(t)).map(t=>t.id);const validPlans=weeklyPlans.filter(plan=>!deletedTaskIds.includes(plan.taskId));localStorage.setItem('weekly_plans',JSON.stringify(validPlans));alert(`清理完成！已删除${deleted}个未知用户任务`);location.reload();}else{alert('没有发现未知用户任务');}})();
```

---

**清理完成后，系统将更加整洁！** 🎉


