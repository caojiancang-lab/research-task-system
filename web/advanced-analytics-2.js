// 高级数据分析模块 - Part 2
// 经费使用效率分析

(function() {
    // ==================== 经费使用效率分析 ====================
    
    // 为任务添加经费字段
    TaskSystem.prototype.initializeBudgetFields = function() {
        this.tasks.forEach(task => {
            if (!task.hasOwnProperty('budget')) {
                task.budget = 0; // 预算
            }
            if (!task.hasOwnProperty('actualCost')) {
                task.actualCost = 0; // 实际花费
            }
        });
        this.saveData();
    };
    
    // 显示经费分析
    TaskSystem.prototype.showBudgetAnalysis = function() {
        const budgetData = this.calculateBudgetAnalysis();
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2>💰 经费使用效率分析</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div style="padding: 24px; max-height: 70vh; overflow-y: auto;">
                    <!-- 经费概览 -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
                        <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; text-align: center;">
                            <div style="font-size: 28px; font-weight: 700; margin-bottom: 4px;">¥${budgetData.totalBudget.toLocaleString()}</div>
                            <div style="font-size: 14px; opacity: 0.9;">总预算</div>
                        </div>
                        <div style="padding: 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 12px; text-align: center;">
                            <div style="font-size: 28px; font-weight: 700; margin-bottom: 4px;">¥${budgetData.totalCost.toLocaleString()}</div>
                            <div style="font-size: 14px; opacity: 0.9;">实际花费</div>
                        </div>
                        <div style="padding: 20px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border-radius: 12px; text-align: center;">
                            <div style="font-size: 28px; font-weight: 700; margin-bottom: 4px;">${budgetData.utilizationRate}%</div>
                            <div style="font-size: 14px; opacity: 0.9;">使用率</div>
                        </div>
                        <div style="padding: 20px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border-radius: 12px; text-align: center;">
                            <div style="font-size: 28px; font-weight: 700; margin-bottom: 4px;">¥${budgetData.remaining.toLocaleString()}</div>
                            <div style="font-size: 14px; opacity: 0.9;">剩余预算</div>
                        </div>
                    </div>
                    
                    <!-- 预算执行情况 -->
                    <div style="margin-bottom: 24px; padding: 20px; background: #f8fafc; border-radius: 12px;">
                        <h3 style="margin-bottom: 16px;">📊 预算执行情况</h3>
                        <div style="height: 12px; background: #e2e8f0; border-radius: 6px; overflow: hidden; margin-bottom: 12px;">
                            <div style="height: 100%; width: ${budgetData.utilizationRate}%; background: linear-gradient(90deg, #667eea, #764ba2); transition: width 0.5s;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 13px; color: #64748b;">
                            <span>已使用 ${budgetData.utilizationRate}%</span>
                            <span>剩余 ${100 - budgetData.utilizationRate}%</span>
                        </div>
                    </div>
                    
                    <!-- 经费效率指标 -->
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
                        <div style="padding: 20px; background: white; border: 2px solid #e2e8f0; border-radius: 12px;">
                            <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">单位产出成本</div>
                            <div style="font-size: 24px; font-weight: 700; color: #667eea;">¥${budgetData.costPerTask.toLocaleString()}</div>
                            <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">每个任务</div>
                        </div>
                        <div style="padding: 20px; background: white; border: 2px solid #e2e8f0; border-radius: 12px;">
                            <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">投入产出比</div>
                            <div style="font-size: 24px; font-weight: 700; color: #10b981;">1:${budgetData.roi.toFixed(2)}</div>
                            <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">ROI</div>
                        </div>
                        <div style="padding: 20px; background: white; border: 2px solid #e2e8f0; border-radius: 12px;">
                            <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">预算偏差率</div>
                            <div style="font-size: 24px; font-weight: 700; color: ${budgetData.deviationRate > 10 ? '#ef4444' : '#10b981'};">${budgetData.deviationRate}%</div>
                            <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">${budgetData.deviationRate > 0 ? '超支' : '节约'}</div>
                        </div>
                    </div>
                    
                    <!-- 分类经费分析 -->
                    <div style="margin-bottom: 24px;">
                        <h3 style="margin-bottom: 16px;">📈 分类经费分析</h3>
                        ${this.renderBudgetByCategory(budgetData.byCategory)}
                    </div>
                    
                    <!-- 经费预警 -->
                    ${budgetData.warnings.length > 0 ? `
                        <div style="padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 12px;">
                            <h3 style="margin-bottom: 16px; color: #92400e;">⚠️ 经费预警</h3>
                            ${budgetData.warnings.map(w => `
                                <div style="padding: 12px; margin-bottom: 8px; background: white; border-radius: 8px;">
                                    <strong style="color: #92400e;">${w.title}</strong>
                                    <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">${w.message}</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="app.exportBudgetReport()">导出报告</button>
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">关闭</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };
    
    // 计算经费分析数据
    TaskSystem.prototype.calculateBudgetAnalysis = function() {
        const totalBudget = this.tasks.reduce((sum, t) => sum + (t.budget || 0), 0);
        const totalCost = this.tasks.reduce((sum, t) => sum + (t.actualCost || 0), 0);
        const remaining = totalBudget - totalCost;
        const utilizationRate = totalBudget > 0 ? Math.round((totalCost / totalBudget) * 100) : 0;
        
        const completedTasks = this.tasks.filter(t => t.status === 'completed').length;
        const costPerTask = completedTasks > 0 ? Math.round(totalCost / completedTasks) : 0;
        
        // ROI = 完成任务数 / (实际花费 / 1000)
        const roi = totalCost > 0 ? (completedTasks / (totalCost / 1000)) : 0;
        
        // 预算偏差率
        const deviationRate = totalBudget > 0 ? Math.round(((totalCost - totalBudget) / totalBudget) * 100) : 0;
        
        // 按类别统计
        const byCategory = {};
        this.tasks.forEach(task => {
            if (!byCategory[task.type]) {
                byCategory[task.type] = { budget: 0, cost: 0, count: 0 };
            }
            byCategory[task.type].budget += task.budget || 0;
            byCategory[task.type].cost += task.actualCost || 0;
            byCategory[task.type].count++;
        });
        
        // 经费预警
        const warnings = [];
        if (utilizationRate > 90) {
            warnings.push({
                title: '预算即将用尽',
                message: `已使用 ${utilizationRate}% 的预算，请注意控制支出`
            });
        }
        if (deviationRate > 20) {
            warnings.push({
                title: '预算严重超支',
                message: `实际花费超出预算 ${deviationRate}%，需要追加预算或调整计划`
            });
        }
        
        // 检查单个任务超支
        const overbudgetTasks = this.tasks.filter(t => 
            t.budget > 0 && t.actualCost > t.budget * 1.2
        );
        if (overbudgetTasks.length > 0) {
            warnings.push({
                title: '部分任务超支',
                message: `有 ${overbudgetTasks.length} 个任务超出预算20%以上`
            });
        }
        
        return {
            totalBudget,
            totalCost,
            remaining,
            utilizationRate,
            costPerTask,
            roi,
            deviationRate,
            byCategory,
            warnings
        };
    };
    
    // 渲染分类经费
    TaskSystem.prototype.renderBudgetByCategory = function(byCategory) {
        return Object.entries(byCategory).map(([category, data]) => {
            const utilizationRate = data.budget > 0 ? Math.round((data.cost / data.budget) * 100) : 0;
            const avgCost = data.count > 0 ? Math.round(data.cost / data.count) : 0;
            
            return `
                <div style="padding: 16px; margin-bottom: 12px; background: white; border: 2px solid #e2e8f0; border-radius: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <strong style="font-size: 16px;">${category}</strong>
                        <span style="font-size: 14px; color: #64748b;">${data.count}个任务</span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 12px;">
                        <div>
                            <div style="font-size: 12px; color: #64748b;">预算</div>
                            <div style="font-size: 16px; font-weight: 600;">¥${data.budget.toLocaleString()}</div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: #64748b;">实际</div>
                            <div style="font-size: 16px; font-weight: 600;">¥${data.cost.toLocaleString()}</div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: #64748b;">平均</div>
                            <div style="font-size: 16px; font-weight: 600;">¥${avgCost.toLocaleString()}</div>
                        </div>
                    </div>
                    <div style="height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                        <div style="height: 100%; width: ${Math.min(utilizationRate, 100)}%; background: ${utilizationRate > 100 ? '#ef4444' : '#10b981'}; transition: width 0.5s;"></div>
                    </div>
                    <div style="margin-top: 4px; font-size: 12px; color: ${utilizationRate > 100 ? '#ef4444' : '#10b981'}; font-weight: 600;">
                        使用率: ${utilizationRate}%
                    </div>
                </div>
            `;
        }).join('');
    };
    
    // 导出经费报告
    TaskSystem.prototype.exportBudgetReport = function() {
        this.showToast('报告导出功能开发中...', 'info');
    };
    
    // 初始化经费字段
    if (app) {
        app.initializeBudgetFields();
    }
    
    console.log('✅ 高级数据分析模块 Part 2 已加载');
})();


