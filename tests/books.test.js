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


// GET /api/books - Filtering
describe('GET /api/books - Filtering', () => {

  // Create some test books
  const books = [
    { title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', isbn: '3269-1234567890', year: 1954 },
    { title: 'Harry Potter', author: 'J.K. Rowling', isbn: '1234-5678901234', year: 1997 },
    { title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '5678-9012345678', year: 1937 }
  ];

  beforeEach(async () => {
    await Book.create(books);
  });

  it('should filter books by title (case-insensitive)', async () => {
    const res = await request(app).get('/api/books?title=lord');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.every(book => book.title.toLowerCase().includes('lord'))).toBe(true);
  });

  it('should filter books by author (case-insensitive)', async () => {
    const res = await request(app).get('/api/books?author=rowling');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.every(book => book.author.toLowerCase().includes('rowling'))).toBe(true);
  });

  it('should filter books by ISBN (case-insensitive)', async () => {
    const res = await request(app).get('/api/books?isbn=3269');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.every(book => book.isbn.toLowerCase().includes('3269'))).toBe(true);
  });

  it('should filter books using the "search" parameter for title, author, or ISBN', async () => {
    const res = await request(app).get('/api/books?search=tolkien');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);

    // Check if the search term is found in either title, author, or ISBN
    expect(res.body.data.some(book => {
      return book.title.toLowerCase().includes('tolkien') ||
        book.author.toLowerCase().includes('tolkien') ||
        book.isbn.toLowerCase().includes('tolkien');
    })).toBe(true);
  });

});



// GET /api/books - Pagination 
describe('GET /api/books - Pagination', () => {
  beforeEach(async () => {
    // Add enough books to the database to test pagination
    const extraBooks = [];
    // add random books to the database
    for (let i = 0; i < 11; i++) {
      const book = {
        title: `Book ${i + 1}`,
        author: `Author ${i + 1}`,
        year: 2020 + i,
        isbn: `978-1-23456789-${i}`
      };
      extraBooks.push(book);
    }

    await Book.insertMany(extraBooks);
  });

  it('should return the first page of books with default limit', async () => {
    const res = await request(app).get('/api/books');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(10);
    expect(res.body.totalItems).toBeGreaterThanOrEqual(10);
    expect(res.body.totalPages).toBeGreaterThanOrEqual(1);
  });

  it('should return the specified page and limit', async () => {
    const res = await request(app).get('/api/books?page=2&limit=3');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(3);
    expect(res.body.currentPage).toBe(2);
  });

  it('should return an empty array if page is out of range', async () => {
    const res = await request(app).get('/api/books?page=100&limit=10');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(0);
  });

  it('should provide "next" and "previous" links correctly', async () => {
    // Test with a limit that will result in multiple pages
    const res = await request(app).get('/api/books?limit=2');

    // Should have a "next" link
    expect(res.body.next).toBeTruthy();
    expect(res.body.next.page).toBe(2);

    // Should not have a "previous" link on the first page
    expect(res.body.previous).toBeFalsy();

    // Get the second page
    const res2 = await request(app).get(`/api/books?page=${res.body.next.page}&limit=2`);

    // Second page should have both "next" and "previous" links
    expect(res2.body.next).toBeTruthy();
    expect(res2.body.previous).toBeTruthy();
  });
});
