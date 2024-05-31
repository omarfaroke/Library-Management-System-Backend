const request = require('supertest');

const app = require('../src/app');
const User = require('../src/models/user.model');
const { setUp, tearDown } = require('./setup');

beforeAll(async () => {
  await setUp();
});

beforeEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await tearDown();
});

let token;

// Sample user data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
};

const invalidUser = {
  name: 123,
  email: 'invalidemail',
};


describe('Users API', () => {
  // User Registration
  describe('POST /api/users/register', () => {
    it('should register a new user with valid data', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');

      // Verify user is added to the database
      const user = await User.findOne({ email: testUser.email });
      expect(user).toBeTruthy();
      expect(user.name).toBe(testUser.name);

      // Store token for later use in tests
      token = res.body.token;
    });

    it('should return 400 with validation errors for invalid user data', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send(invalidUser);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Validation Error');
    });

    it('should return 400 if email already exists', async () => {
      // Register the user first
      await request(app).post('/api/users/register').send(testUser);

      // Try to register with the same email again
      const res = await request(app)
        .post('/api/users/register')
        .send(testUser);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Email is already in use.');
    });
  });

  // User Login
  describe('POST /api/users/login', () => {
    it('should log in an existing user with valid credentials', async () => {
      // Register a user first
      await request(app).post('/api/users/register').send(testUser);
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
    });

    it('should return 401 for invalid email', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'wrongemail@example.com',
          password: testUser.password,
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Invalid credentials.');
    });

    it('should return 401 for invalid password', async () => {
      // Register a user first
      await request(app).post('/api/users/register').send(testUser);

      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Invalid credentials.');
    });
  });


  // Get Profile
  describe('GET /api/users/profile', () => {
    it('should get the user profile (with valid token)', async () => {
      // Register and get token
      const registerResponse = await request(app).post('/api/users/register').send(testUser);
      const userToken = registerResponse.body.token;

      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', userToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data.name).toBe(testUser.name);
      expect(res.body.data.email).toBe(testUser.email);
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should return 401 for unauthorized requests (no token)', async () => {
      const res = await request(app).get('/api/users/profile');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'No token, authorization denied.');
    });
  });


  // Update Profile
  describe('PUT /api/users/profile', () => {
    it('should update the user profile (with valid token and data)', async () => {
      // Register and get token
      const registerResponse = await request(app).post('/api/users/register').send(testUser);
      const userToken = registerResponse.body.token;

      const updatedData = {
        name: 'Updated Name'
      };

      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', userToken)
        .send(updatedData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data.name).toBe(updatedData.name);

      const updatedUser = await User.findOne({ email: testUser.email });
      expect(updatedUser.name).toBe(updatedData.name);
    });

    it('should return 401 for unauthorized requests (no token)', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .send({ name: 'New Name' });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'No token, authorization denied.');
    });

    // ... Add more tests for invalid data or other cases
  });


});

