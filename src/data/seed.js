require('dotenv').config();

const connectDB = require('../config/database');
const mongoose = require('mongoose');
const Book = require('../models/book.model');
const User = require('../models/user.model');
const Loan = require('../models/loan.model');
const bcrypt = require('bcrypt');

const booksData = [
    {
        title: 'المقدمة',
        author: 'ابن خلدون',
        year: 1377,
        isbn: '978-9-876-54321-0'
    },
    {
        title: 'قواعد العشق الأربعون',
        author: 'إليف شافاق',
        year: 2009,
        isbn: '978-0-123-45678-9'
    },
    {
        title: 'الهويات القاتلة',
        author: 'أمين معلوف',
        year: 2018,
        isbn: '978-9-876-54421-0'
    },
    {
        title: 'Atomic Habits',
        author: 'James Clear',
        year: 2018,
        isbn: '978-0-525-57499-3'
    },
];

const usersData = [
    {
        name: 'محمد أحمد',
        email: 'mohamed.ahmed@example.com',
        password: 'password123'
    },
    {
        name: 'فاطمة علي',
        email: 'fatima.ali@example.com',
        password: 'securepassword'
    },
    {
        name: 'Omar Ali',
        email: 'omar.ali@example.com',
        password: 'password123'
    },
];

const loansData = [
    // Add loan data after users and books are created
];

const seedDatabase = async () => {
    console.log('Seeding database...');
    try {

        await connectDB();

        await Book.deleteMany({});
        await User.deleteMany({});
        await Loan.deleteMany({});

        const insertedBooks = await Book.insertMany(booksData);

        const hashedUsers = await Promise.all(
            usersData.map(async (user) => {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
                return user;
            })
        );
        const insertedUsers = await User.insertMany(hashedUsers);

        loansData.push({
            user: insertedUsers[0]._id,
            book: insertedBooks[1]._id,
            borrowDate: new Date(),
            returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        await Loan.insertMany(loansData);

        console.log('Data seeded successfully!');
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding data: ', error);
        mongoose.connection.close();

        // Exit the process if an error occurs and the script is run directly
        if (module === require.main) {
            process.exitCode = 1;
        }
    }
};


// Seed the database if the script is run directly
if (module === require.main) {
    seedDatabase();
}

module.exports = seedDatabase;

// run the seed script
// node src/data/seed.js
// or
// npm run seed