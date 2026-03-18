const express = require('express');

/**
 * Express 应用实例
 * @type {express.Application}
 */
const app = express();

/**
 * 服务器端口
 * @type {number}
 */
const PORT = process.env.PORT || 3000;

// 配置中间件
app.use(express.json()); // JSON body parser
app.use(express.urlencoded({ extended: true })); // URL-encoded body parser

/**
 * 健康检查路由
 * @route GET /
 * @returns {Object} 200 - 服务状态对象
 */
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * 任务路由（占位符）
 * 后续将实现完整的 CRUD 操作
 */
app.get('/api/tasks', (req, res) => {
  res.status(200).json([]);
});

app.post('/api/tasks', (req, res) => {
  res.status(201).json({ message: 'Task creation endpoint - to be implemented' });
});

app.get('/api/tasks/:id', (req, res) => {
  res.status(404).json({ message: 'Task not found' });
});

app.patch('/api/tasks/:id', (req, res) => {
  res.status(404).json({ message: 'Task not found' });
});

app.delete('/api/tasks/:id', (req, res) => {
  res.status(404).json({ message: 'Task not found' });
});

/**
 * 启动服务器
 * @listens {number} PORT - 服务器监听端口
 */
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

/**
 * 导出 app 和 server 用于测试
 */
module.exports = { app, server };
