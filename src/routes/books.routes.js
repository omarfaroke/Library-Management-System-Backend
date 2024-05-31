const express = require('express');
const router = express.Router();
const bookController = require('../controllers/books.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public Routes 
router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBookById);

// Protected Routes (require authentication)
router.use(authMiddleware);

router.post('/', bookController.createBook);
router.put('/:id', bookController.updateBook);
router.delete('/:id', bookController.deleteBook);

module.exports = router;
