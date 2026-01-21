# 文件清理指南

## 📋 当前文件状态

### 核心系统文件（保留）

**HTML文件**：
- ✅ `web/advanced-system.html` - 主系统界面
- ✅ `web/neuro-simple.html` - 登录页面
- ✅ `web/admin.html` - 管理后台

**核心JS文件**：
- ✅ `web/advanced-app.js` - 核心应用逻辑
- ✅ `web/admin-app.js` - 管理后台逻辑
- ✅ `web/advanced-enhance.js` - 系统增强
- ✅ `web/advanced-features.js` - V2.5高级功能
- ✅ `web/advanced-analytics-1.js` - 高级分析1
- ✅ `web/advanced-analytics-2.js` - 高级分析2
- ✅ `web/feedback-system.js` - 反馈系统
- ✅ `web/data-visualization.js` - 数据可视化
- ✅ `web/profile-enhance.js` - 个人中心增强
- ✅ `web/comprehensive-fix.js` - 综合修复
- ✅ `web/task-improvements.js` - V2.6任务改进
- ✅ `web/v2.7-improvements.js` - V2.7改进
- ✅ `web/v2.7.1-fixes.js` - V2.7.1修复

**CSS文件**：
- ✅ `web/advanced-style.css` - 样式文件

**工具脚本**：
- ✅ `web/cleanup-data.js` - 数据清理脚本（新增）

---

## 🗑️ 可删除的旧文件

### 旧版本文件（可删除）
```
web/neuro-app.js - 旧版本应用
web/js/neuro-auth.js - 旧版本认证
web/js/app-pro.js - 旧版本应用
web/js/auth.js - 旧版本认证
web/js/app.js - 旧版本应用
```

### 旧文档文件（可删除）
```
FEATURE_CHECKLIST.md
README_V2.md
QUICK_START.md
IMPLEMENTATION_SUMMARY.md
UPDATE_LOG_V2.md
TEST_GUIDE.md
COMPLETE_USER_GUIDE.md
FINAL_GUIDE.md
CODE_SUPPLEMENT.md
UPDATE_LOG.md
ADMIN_GUIDE.md
PERMISSION_GUIDE.md
ADVANCED_GUIDE.md
NEURO_COMPLETE_GUIDE.md
NEURO_SYSTEM_GUIDE.md
MULTI_USER_GUIDE.md
WEB_QUICK_START.md
INSTALLATION_GUIDE.md
USAGE_GUIDE.md
V2.5_SUMMARY.md
```

---

## 📚 保留的文档（重要）

```
README.md - 项目说明
UPDATE_V2.5.md - V2.5更新文档
UPDATE_V2.6.md - V2.6更新文档
V2.6_快速指南.md - V2.6快速指南
UPDATE_V2.7.md - V2.7更新文档
V2.7_快速指南.md - V2.7快速指南
UPDATE_V2.7.1.md - V2.7.1更新文档
V2.7.1_快速指南.md - V2.7.1快速指南
```

---

## 🧹 清理步骤

### 步骤1：清理旧任务数据

1. 打开浏览器，访问系统
2. 按F12打开开发者工具
3. 切换到"Console"（控制台）标签
4. 复制并运行以下代码：

```javascript
// 清理所有任务
localStorage.setItem('tasks_data', '[]');
localStorage.setItem('weekly_plans', '[]');
console.log('✅ 任务数据已清理');
location.reload();
```

### 步骤2：删除旧文件

**删除旧JS文件**：
```bash
# 在项目根目录执行
rm web/neuro-app.js
rm -rf web/js
```

**删除旧文档**：
```bash
rm FEATURE_CHECKLIST.md
rm README_V2.md
rm QUICK_START.md
rm IMPLEMENTATION_SUMMARY.md
rm UPDATE_LOG_V2.md
rm TEST_GUIDE.md
rm COMPLETE_USER_GUIDE.md
rm FINAL_GUIDE.md
rm CODE_SUPPLEMENT.md
rm UPDATE_LOG.md
rm ADMIN_GUIDE.md
rm PERMISSION_GUIDE.md
rm ADVANCED_GUIDE.md
rm NEURO_COMPLETE_GUIDE.md
rm NEURO_SYSTEM_GUIDE.md
rm MULTI_USER_GUIDE.md
rm WEB_QUICK_START.md
rm INSTALLATION_GUIDE.md
rm USAGE_GUIDE.md
rm V2.5_SUMMARY.md
```

---

## ⚠️ 注意事项

1. **备份数据**：删除前请确保已备份重要数据
2. **确认无依赖**：确保没有其他文件依赖这些旧文件
3. **测试系统**：删除后测试系统是否正常运行

---

## 🎯 清理后的文件结构

```
科研任务分配/
├── web/
│   ├── advanced-system.html       # 主系统
│   ├── neuro-simple.html          # 登录页
│   ├── admin.html                 # 管理后台
│   ├── advanced-style.css         # 样式
│   ├── advanced-app.js            # 核心应用
│   ├── admin-app.js               # 管理后台
│   ├── advanced-enhance.js        # 系统增强
│   ├── advanced-features.js       # V2.5功能
│   ├── advanced-analytics-1.js    # 分析1
│   ├── advanced-analytics-2.js    # 分析2
│   ├── feedback-system.js         # 反馈系统
│   ├── data-visualization.js      # 数据可视化
│   ├── profile-enhance.js         # 个人中心
│   ├── comprehensive-fix.js       # 综合修复
│   ├── task-improvements.js       # V2.6改进
│   ├── v2.7-improvements.js       # V2.7改进
│   ├── v2.7.1-fixes.js           # V2.7.1修复
│   └── cleanup-data.js            # 清理脚本
├── README.md                      # 项目说明
├── UPDATE_V2.5.md                 # V2.5文档
├── UPDATE_V2.6.md                 # V2.6文档
├── V2.6_快速指南.md               # V2.6指南
├── UPDATE_V2.7.md                 # V2.7文档
├── V2.7_快速指南.md               # V2.7指南
├── UPDATE_V2.7.1.md               # V2.7.1文档
└── V2.7.1_快速指南.md             # V2.7.1指南
```

---

## 🚀 清理完成后

1. 刷新浏览器
2. 测试系统功能
3. 确认所有功能正常
4. 开始使用全新的系统！


