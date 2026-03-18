# Automated Workflow Demo

这是一个自动化工作流演示项目，用于展示：
- 需求整理
- 自动拆分任务
- Copilot 自动实现
- 自动审核与测试

## 项目目标

构建一个简单的任务管理 API，包含：
- 添加任务
- 查看任务列表
- 完成任务
- 删除任务

## 技术栈

- Node.js
- Express.js
- In-memory 存储（简化演示）

## 自动化流程

1. 需求 → 创建 Issue
2. Issue → 分配给 Copilot
3. Copilot → 创建 PR
4. 定时任务监控 PR 状态
5. PR 完成 → 自动 Review
6. 测试通过 → 合并

## 进度

- [x] 项目初始化
- [ ] 实现核心功能
- [ ] 添加测试
- [ ] 部署上线
