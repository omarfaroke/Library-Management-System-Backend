const request = require('supertest');
const app = require('../src/app');
const Loan = require('../src/models/loan.model');
const User = require('../src/models/user.model');
const Book = require('../src/models/book.model');
const { setUp, tearDown } = require('./setup');
const mongoose = require('mongoose');



let testUser, testBook, testBook2, token;

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

  // Create a test book
  const book = new Book({
    title: 'Test Book',
    author: 'Test Author',
    year: 2023,
    isbn: '978-1234567890'
  });
  await book.save();
  testBook = book;

  const book2 = new Book({
    title: 'Test Book 2',
    author: 'Test Author 2',
    year: 2024,
    isbn: '978-987654321-0'
  });
  await book2.save();
  testBook2 = book2;

  // Get a JWT token for the test user
  const res = await request(app)
    .post('/api/users/login')
    .send({ email: 'test@example.com', password: 'password123' });
  token = res.body.token;
});

beforeEach(async () => {
  await Loan.deleteMany({});
});

afterAll(async () => {
  await tearDown();
});


describe('Loans API (Authenticated)', () => {

  // GET /api/loans
  it('should get all loans (with valid token)', async () => {
    const res = await request(app)
      .get('/api/loans')
      .set('Authorization', token);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
  });


  // GET /api/loans/:id - Loan exists
  it('should get a specific loan by ID', async () => {
    const loan = new Loan({
      user: testUser._id,
      book: testBook._id,
      returnDate: new Date('2024-04-01'),
    });
    await loan.save();

    const res = await request(app)
      .get(`/api/loans/${loan._id}`)
      .set('Authorization', token);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(loan._id.toString());
  });

  // GET /api/loans/:id - Loan does not exist
  it('should return 404 if loan not found', async () => {
    const randomId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/loans/${randomId}`)
      .set('Authorization', token);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });


  // POST /api/loans - Valid data
  it('should create a new loan with valid data', async () => {
    const newLoanData = {
      user: testUser._id,
      book: testBook._id,
      returnDate: new Date('2024-04-01'),
    };

    const res = await request(app)
      .post('/api/loans')
      .set('Authorization', token)
      .send(newLoanData);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBe(newLoanData.user.toString());
    expect(res.body.data.book).toBe(newLoanData.book.toString());
  });


  // PUT /api/loans/:id - Loan exists
  it('should update a loan', async () => {
    const loan = new Loan({
      user: testUser._id,
      book: testBook._id,
      returnDate: new Date('2024-04-01'),
    });
    await loan.save();

    const updatedLoanData = {
      returnDate: new Date('2024-04-15'),
    };

    const res = await request(app)
      .put(`/api/loans/${loan._id}`)
      .set('Authorization', token)
      .send(updatedLoanData);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.returnDate).toBe(updatedLoanData.returnDate.toISOString());
  });


  // DELETE /api/loans/:id - Loan exists
  it('should delete a loan', async () => {
    const loan = new Loan({
      user: testUser._id,
      book: testBook._id,
      returnDate: new Date('2024-04-01'),
    });
    await loan.save();

    const res = await request(app)
      .delete(`/api/loans/${loan._id}`)
      .set('Authorization', token);

    expect(res.statusCode).toBe(204);

    // Verify loan is deleted
    const deletedLoan = await Loan.findById(loan._id);
    expect(deletedLoan).toBeNull();
  });

});


// GET /api/loans - Filtering and Pagination 
describe('GET /api/loans - Filtering and Pagination', () => {
  beforeEach(async () => {
    // Create some loans for testing pagination and filtering
    const loans = [
      { user: testUser._id, book: testBook._id, borrowDate: new Date('2023-10-25'), returnDate: new Date('2023-11-01') },
      { user: testUser._id, book: testBook2._id, borrowDate: new Date('2023-11-05'), returnDate: new Date('2023-11-12') },
      { user: testUser._id, book: testBook._id, borrowDate: new Date('2023-11-15'), returnDate: new Date('2023-11-22') },
    ];
    await Loan.insertMany(loans);
  });

  it('should filter loans by userId', async () => {
    const res = await request(app)
      .get(`/api/loans?userId=${testUser._id}`)
      .set('Authorization', token);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(3);
    expect(res.body.data.every(loan => loan.user._id === testUser._id.toString())).toBe(true);
  });

  it('should filter loans by bookId', async () => {
    const res = await request(app)
      .get(`/api/loans?bookId=${testBook._id}`)
      .set('Authorization', token);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data.every(loan => loan.book._id === testBook._id.toString())).toBe(true);
  });

  it('should filter loans by borrow date range', async () => {
    const res = await request(app)
      .get('/api/loans?borrowedFrom=2023-11-01&borrowedTo=2023-11-15')
      .set('Authorization', token);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it('should filter loans by due date range', async () => {
    const res = await request(app)
      .get('/api/loans?dueFrom=2023-11-10&dueTo=2023-11-25')
      .set('Authorization', token);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it('should apply pagination correctly', async () => {
    const res = await request(app)
      .get('/api/loans?page=1&limit=2')
      .set('Authorization', token);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.totalItems).toBe(3);
    expect(res.body.totalPages).toBe(2);
    expect(res.body.next.page).toBe(2);
  });
});