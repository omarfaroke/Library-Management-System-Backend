const request = require('supertest');
const app = require('../src/app');
const Book = require('../src/models/book.model');
const User = require('../src/models/user.model');
const { setUp, tearDown } = require('./setup');
const mongoose = require('mongoose');


// Sample test data 
const testBook = {
  title: 'Test Book',
  author: 'Test Author',
  year: 2020,
  isbn: '123-4567890123',
};

const invalidBookData = {
  title: 'Test', // Too short
  author: 123, // Invalid type
  year: 'Invalid Year',
  isbn: 12345, // Invalid format
};

let testUser, token;

beforeAll(async () => {

  await setUp();

  // Create a test user for authentication
  const user = new User({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  });
  await user.save();
  testUser = user;

  // Get a JWT token for the test user
  const res = await request(app)
    .post('/api/users/login')
    .send({ email: 'test@example.com', password: 'password123' });
  token = res.body.token;
});



beforeEach(async () => {
  await Book.deleteMany({});
});

afterAll(async () => {
  await tearDown();
});


describe('Books API', () => {

  // GET /api/books
  it('should get all books', async () => {
    const res = await request(app).get('/api/books');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  // GET /api/books/:id - Book exists
  it('should get a specific book by ID', async () => {
    const book = new Book(testBook);
    await book.save();

    const res = await request(app).get(`/api/books/${book._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(book._id.toString());
  });

  // GET /api/books/:id - Book does not exist
  it('should return 404 if book not found', async () => {
    const randomId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/books/${randomId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });


  // POST /api/books - Valid data
  it('should create a new book with valid data', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', token)
      .send(testBook);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(testBook.title);

    // Verify the book is added to the database
    const books = await Book.find();
    expect(books.length).toBe(1);
  });


  // POST /api/books - Invalid data
  it('should return 400 with validation errors for invalid data', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', token)
      .send(invalidBookData);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });

  // PUT /api/books/:id - Valid data
  it('should update a book with valid data', async () => {
    const book = new Book(testBook);
    await book.save();

    const updatedData = {
      title: 'Updated Title',
      author: 'Updated Author',
    };

    const res = await request(app)
      .put(`/api/books/${book._id}`)
      .set('Authorization', token)
      .send(updatedData);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(updatedData.title);
    expect(res.body.data.author).toBe(updatedData.author);
  });

  // PUT /api/books/:id - Invalid data
  it('should return 400 with validation errors for invalid update data', async () => {
    const book = new Book(testBook);
    await book.save();

    const invalidUpdateData = {
      title: 123, // Invalid type
    };

    const res = await request(app)
      .put(`/api/books/${book._id}`)
      .set('Authorization', token)
      .send(invalidUpdateData);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });

  // PUT /api/books/:id - Book does not exist
  it('should return 404 if book not found for update', async () => {
    const randomId = new mongoose.Types.ObjectId();
    const updatedData = {
      title: 'Updated Title',
    };

    const res = await request(app)
      .put(`/api/books/${randomId}`)
      .set('Authorization', token)
      .send(updatedData);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  // DELETE /api/books/:id - Book exists
  it('should delete a book', async () => {
    const book = new Book(testBook);
    await book.save();

    const res = await request(app)
      .delete(`/api/books/${book._id}`)
      .set('Authorization', token);

    expect(res.statusCode).toBe(204);

    // Verify book is deleted
    const deletedBook = await Book.findById(book._id);
    expect(deletedBook).toBeNull();
  });

  // DELETE /api/books/:id - Book does not exist
  it('should return 404 if book not found for deletion', async () => {
    const randomId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/books/${randomId}`)
      .set('Authorization', token);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

});

