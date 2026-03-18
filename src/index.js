const express = require('express');
const { v4: uuidv4 } = require('uuid');

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

/**
 * 任务存储（内存数组）
 * @type {Array<Object>}
 */
const tasks = [];

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
 * 创建新任务
 * @route POST /api/tasks
 * @param {string} req.body.title - 任务标题（必填，最大100字符）
 * @param {string} [req.body.description] - 任务描述（可选，最大500字符）
 * @returns {Object} 201 - 创建的任务对象
 */
app.post('/api/tasks', (req, res) => {
  const { title, description } = req.body;
  
  // 创建新任务
  const newTask = {
    id: uuidv4(),
    title: title,
    description: description || '',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // 添加到存储
  tasks.push(newTask);
  
  res.status(201).json(newTask);
});

/**
 * 获取所有任务
 * @route GET /api/tasks
 * @returns {Array<Object>} 200 - 任务数组
 */
app.get('/api/tasks', (req, res) => {
  res.status(200).json(tasks);
});

/**
 * 获取单个任务
 * @route GET /api/tasks/:id
 * @param {string} req.params.id - 任务ID
 * @returns {Object} 200 - 任务对象
 * @returns {Object} 404 - 任务未找到
 */
app.get('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const task = tasks.find(t => t.id === id);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  res.status(200).json(task);
});

/**
 * 更新任务
 * @route PATCH /api/tasks/:id
 * @param {string} req.params.id - 任务ID
 * @param {string} [req.body.title] - 新的任务标题
 * @param {string} [req.body.description] - 新的任务描述
 * @param {boolean} [req.body.completed] - 新的完成状态
 * @returns {Object} 200 - 更新后的任务对象
 * @returns {Object} 404 - 任务未找到
 */
app.patch('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;
  
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  // 更新任务字段
  const task = tasks[taskIndex];
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (completed !== undefined) task.completed = completed;
  task.updatedAt = new Date();
  
  res.status(200).json(task);
});

/**
 * 删除任务
 * @route DELETE /api/tasks/:id
 * @param {string} req.params.id - 任务ID
 * @returns {void} 204 - 无内容
 * @returns {Object} 404 - 任务未找到
 */
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  // 删除任务
  tasks.splice(taskIndex, 1);
  
  res.status(204).send();
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
module.exports = { app, server, tasks };
