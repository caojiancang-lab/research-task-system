// 删除未知用户任务的脚本
// 在浏览器控制台运行此脚本

(function() {
    console.log('🧹 开始清理未知用户的任务...');
    
    // 1. 获取所有用户
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const validUserIds = users.map(u => u.id);
    
    console.log(`有效用户数量: ${validUserIds.length}`);
    console.log('有效用户ID:', validUserIds);
    
    // 2. 获取所有任务
    const tasks = JSON.parse(localStorage.getItem('tasks_data') || '[]');
    console.log(`当前任务总数: ${tasks.length}`);
    
    // 3. 筛选出未知用户的任务
    const unknownUserTasks = tasks.filter(task => {
        const userId = task.userId || task.assigneeId || task.assignerId;
        return userId && !validUserIds.includes(userId);
    });
    
    console.log(`未知用户任务数量: ${unknownUserTasks.length}`);
    
    if (unknownUserTasks.length > 0) {
        console.log('\n未知用户任务列表:');
        unknownUserTasks.forEach((task, index) => {
            console.log(`${index + 1}. ${task.name} (ID: ${task.id}, 用户ID: ${task.userId || task.assigneeId})`);
        });
        
        // 4. 删除未知用户的任务
        const validTasks = tasks.filter(task => {
            const userId = task.userId || task.assigneeId || task.assignerId;
            // 保留有效用户的任务，或者没有用户ID的任务
            return !userId || validUserIds.includes(userId);
        });
        
        console.log(`\n删除后剩余任务数量: ${validTasks.length}`);
        
        // 5. 保存清理后的任务
        localStorage.setItem('tasks_data', JSON.stringify(validTasks));
        
        console.log('✅ 未知用户任务已删除！');
        console.log(`共删除 ${unknownUserTasks.length} 个任务`);
        
        // 6. 清理周计划数据
        const weeklyPlans = JSON.parse(localStorage.getItem('weekly_plans') || '[]');
        const deletedTaskIds = unknownUserTasks.map(t => t.id);
        const validPlans = weeklyPlans.filter(plan => !deletedTaskIds.includes(plan.taskId));
        
        if (validPlans.length !== weeklyPlans.length) {
            localStorage.setItem('weekly_plans', JSON.stringify(validPlans));
            console.log(`✅ 清理了 ${weeklyPlans.length - validPlans.length} 个相关周计划`);
        }
        
        console.log('\n🎉 清理完成！请刷新页面查看效果。');
        
        // 询问是否刷新
        if (confirm('清理完成！是否立即刷新页面？')) {
            location.reload();
        }
    } else {
        console.log('✅ 没有发现未知用户的任务，无需清理。');
    }
    
    // 7. 显示当前任务统计
    console.log('\n📊 当前任务统计:');
    const currentTasks = JSON.parse(localStorage.getItem('tasks_data') || '[]');
    const tasksByUser = {};
    
    currentTasks.forEach(task => {
        const userId = task.userId || task.assigneeId || task.assignerId;
        const user = users.find(u => u.id === userId);
        const userName = user ? user.name : '未知用户';
        
        if (!tasksByUser[userName]) {
            tasksByUser[userName] = 0;
        }
        tasksByUser[userName]++;
    });
    
    Object.entries(tasksByUser).forEach(([userName, count]) => {
        console.log(`  ${userName}: ${count} 个任务`);
    });
    
})();


