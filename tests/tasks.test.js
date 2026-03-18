const request = require('supertest');
const { app, server, tasks } = require('../src/index');

/**
 * Tasks API 单元测试
 */
describe('Tasks API', () => {
  // 每个测试前清空任务数组
  beforeEach(() => {
    tasks.length = 0;
  });

  // 测试结束后关闭服务器
  afterAll(() => {
    server.close();
  });

  describe('POST /api/tasks', () => {
    it('should create a new task successfully', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          description: 'Test Description'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Task');
      expect(response.body.description).toBe('Test Description');
      expect(response.body.completed).toBe(false);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should fail when title is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          description: 'Test Description'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Title is required');
    });

    it('should fail when title exceeds 100 characters', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'a'.repeat(101)
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('100 characters or less');
    });

    it('should fail when description exceeds 500 characters', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          description: 'a'.repeat(501)
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('500 characters or less');
    });

    it('should trim whitespace from title and description', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: '  Test Task  ',
          description: '  Test Description  '
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Test Task');
      expect(response.body.description).toBe('Test Description');
    });
  });

  describe('GET /api/tasks', () => {
    it('should return empty array when no tasks exist', async () => {
      const response = await request(app)
        .get('/api/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return array with multiple tasks', async () => {
      // 创建多个任务
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Task 1' });
      
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Task 2' });

      const response = await request(app)
        .get('/api/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Task 1');
      expect(response.body[1].title).toBe('Task 2');
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return a task when it exists', async () => {
      // 创建一个任务
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task' });

      const taskId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/tasks/${taskId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(taskId);
      expect(response.body.title).toBe('Test Task');
    });

    it('should return 404 when task does not exist', async () => {
      const response = await request(app)
        .get('/api/tasks/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('should update a task successfully', async () => {
      // 创建一个任务
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Original Title' });

      const taskId = createResponse.body.id;

      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 404 when task does not exist', async () => {
      const response = await request(app)
        .patch('/api/tasks/non-existent-id')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });

    it('should support partial field updates', async () => {
      // 创建一个任务
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ 
          title: 'Original Title',
          description: 'Original Description'
        });

      const taskId = createResponse.body.id;

      // 只更新 completed 字段
      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .send({ completed: true });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Original Title');
      expect(response.body.description).toBe('Original Description');
      expect(response.body.completed).toBe(true);
    });

    it('should fail with empty request body', async () => {
      // 创建一个任务
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task' });

      const taskId = createResponse.body.id;

      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('cannot be empty');
    });

    it('should fail when title exceeds 100 characters', async () => {
      // 创建一个任务
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task' });

      const taskId = createResponse.body.id;

      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .send({ title: 'a'.repeat(101) });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('100 characters or less');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task successfully', async () => {
      // 创建一个任务
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task' });

      const taskId = createResponse.body.id;

      const response = await request(app)
        .delete(`/api/tasks/${taskId}`);

      expect(response.status).toBe(204);

      // 确认任务已删除
      const getResponse = await request(app)
        .get(`/api/tasks/${taskId}`);
      
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 when task does not exist', async () => {
      const response = await request(app)
        .delete('/api/tasks/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('Input Validation', () => {
    it('should reject empty title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '   ' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('non-empty string');
    });

    it('should reject non-string title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 123 });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('non-empty string');
    });

    it('should reject non-boolean completed', async () => {
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task' });

      const taskId = createResponse.body.id;

      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .send({ completed: 'yes' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('boolean');
    });
  });

  describe('GET /', () => {
    it('should return health check status', async () => {
      const response = await request(app)
        .get('/');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});
