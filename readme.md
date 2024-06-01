## Library Management System - Backend (Node.js & Express) - **Submitted to Mosnad Platform**

### Project Description

This project is a RESTful API for managing a library system,**developed as part of the application requirements for the Mosnad Platform ([mosnad.net](https://mosnad.net)).** The project aims to demonstrate my skills in backend API development using modern and advanced technologies.

### Technologies Used

- Node.js
- Express.js
- MongoDB
- Joi (for data validation)
- JWT (for authentication)
- Helmet (for security)
- Swagger (for documentation)
- Jest & mongodb-memory-server (for testing)

### Features

- **Book Management:** Add, view, update, and delete books. Search books by title, author, year, or ISBN.
- **User Management:** Register new users, log in, view and update user profiles.
- **Loan Management:** Borrow and return books, view and search loan history.
- **Comprehensive Error Handling:**  A robust and custom error handling system with detailed error classes. 
- **Detailed API Documentation:**  Using Swagger for clear and comprehensive documentation.
- **Thorough Unit Tests:**  Implemented with Jest and `mongodb-memory-server`  to ensure code quality.
- **Security Best Practices:** Including the use of `helmet` for enhanced security.

### How to Run

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Set Up Environment Variables

- Create a file named `.env` in the project root directory (or copy `.env.sample`).
- Add the following variables:

```bash
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h  # Or any desired expiration time
PORT=5000  # Optional, you can change the port number
```

#### 3. Seed the Database (Optional)

- If you want to add initial data to the database, run the following command:

```bash
npm run seed
```

see the seed data file in `./src/data/seed.js`

#### 4. Run the Application

```bash
# For development:
npm run dev

# For deployment:
npm start
```

#### 5. Access Swagger Documentation

- After running the application, you can access the Swagger documentation at:

```bash
http://localhost:5000/api-docs
```

### Running Tests

#### 1. Run Tests

```bash
npm run test
```

#### 2. Run Tests with ability to debug

```bash
npm run test:debug
```

### Additional Notes

- This application was built using best practices in API development, with a focus on error handling, security, and performance efficiency.
- This project represents the backend (server-side) of a complete digital library management system.
