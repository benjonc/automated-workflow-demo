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
 * 验证任务输入数据
 * @param {Object} data - 要验证的数据
 * @param {boolean} isUpdate - 是否为更新操作
 * @returns {Object} 验证结果 { valid: boolean, error?: string }
 */
const validateTaskInput = (data, isUpdate = false) => {
  const { title, description, completed } = data;

  // 创建操作时，title 必填
  if (!isUpdate && !title) {
    return { valid: false, error: 'Title is required' };
  }

  // 验证 title
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return { valid: false, error: 'Title must be a non-empty string' };
    }
    if (title.length > 100) {
      return { valid: false, error: 'Title must be 100 characters or less' };
    }
  }

  // 验证 description
  if (description !== undefined) {
    if (typeof description !== 'string') {
      return { valid: false, error: 'Description must be a string' };
    }
    if (description.length > 500) {
      return { valid: false, error: 'Description must be 500 characters or less' };
    }
  }

  // 验证 completed
  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      return { valid: false, error: 'Completed must be a boolean' };
    }
  }

  return { valid: true };
};

/**
 * 统一错误处理中间件
 * @param {Error} err - 错误对象
 * @param {express.Request} req - 请求对象
 * @param {express.Response} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // 处理 JSON 解析错误
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON',
      details: 'Request body contains invalid JSON'
    });
  }

  // 默认服务器错误
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
};

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
 * @returns {Object} 400 - 验证错误
 */
app.post('/api/tasks', (req, res) => {
  const { title, description } = req.body;
  
  // 输入验证
  const validation = validateTaskInput(req.body, false);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }
  
  // 创建新任务
  const newTask = {
    id: uuidv4(),
    title: title.trim(),
    description: description ? description.trim() : '',
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
  
  // 验证 ID 格式（简单的 UUID 格式检查）
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid task ID format' });
  }
  
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
 * @returns {Object} 400 - 验证错误
 * @returns {Object} 404 - 任务未找到
 */
app.patch('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;
  
  // 验证 ID 格式
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid task ID format' });
  }
  
  // 检查请求体是否为空
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Request body cannot be empty' });
  }
  
  // 输入验证
  const validation = validateTaskInput(req.body, true);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }
  
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  // 更新任务字段
  const task = tasks[taskIndex];
  if (title !== undefined) task.title = title.trim();
  if (description !== undefined) task.description = description.trim();
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
  
  // 验证 ID 格式
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid task ID format' });
  }
  
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  // 删除任务
  tasks.splice(taskIndex, 1);
  
  res.status(204).send();
});

// 404 处理 - 未找到路由
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 注册全局错误处理中间件
app.use(errorHandler);

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
module.exports = { app, server, tasks, validateTaskInput };
