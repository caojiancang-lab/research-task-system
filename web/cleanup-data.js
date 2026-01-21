// 清理旧任务和数据的脚本
// 在浏览器控制台运行此脚本

(function() {
    console.log('🧹 开始清理旧数据...');
    
    // 1. 清理所有任务数据
    const tasks = JSON.parse(localStorage.getItem('tasks_data') || '[]');
    console.log(`当前任务数量: ${tasks.length}`);
    
    if (tasks.length > 0) {
        if (confirm(`确定要删除所有 ${tasks.length} 个任务吗？此操作不可恢复！`)) {
            localStorage.setItem('tasks_data', '[]');
            console.log('✅ 所有任务已清理');
        } else {
            console.log('❌ 取消清理任务');
        }
    } else {
        console.log('✅ 没有需要清理的任务');
    }
    
    // 2. 清理周计划数据
    const weeklyPlans = JSON.parse(localStorage.getItem('weekly_plans') || '[]');
    console.log(`当前周计划数量: ${weeklyPlans.length}`);
    
    if (weeklyPlans.length > 0) {
        localStorage.setItem('weekly_plans', '[]');
        console.log('✅ 周计划数据已清理');
    }
    
    // 3. 显示当前用户列表
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    console.log(`\n当前用户列表 (${users.length}个):`);
    users.forEach(u => {
        console.log(`  - ${u.name} (${u.studentId}) - ${u.role === 'admin' ? '管理员' : '普通用户'}`);
    });
    
    console.log('\n🎉 数据清理完成！');
    console.log('请刷新页面以查看效果。');
})();


