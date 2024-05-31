const Book = require('../models/book.model');
const { NotFoundError, ValidationError } = require('../utils/errorHandler');
const { bookSchema } = require('../utils/validationSchemas');
const validationHelper = require('../utils/validationHelper');
const paginate = require('../utils/paginationHelper');

// Get all books
exports.getAllBooks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Create a filter object based on query parameters
    const filter = {};

    // Filter by title, author, or ISBN using a single 'search' parameter
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i'); // Case-insensitive search
      filter.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { isbn: searchRegex }
      ];
    } else {
      // Individual filters
      if (req.query.title) {
        filter.title = { $regex: req.query.title, $options: 'i' };
      }
      if (req.query.author) {
        filter.author = { $regex: req.query.author, $options: 'i' };
      }
      if (req.query.isbn) {
        filter.isbn = { $regex: req.query.isbn, $options: 'i' };
      }
    }

    // Use the paginate helper function
    const results = await paginate(Book, filter, page, limit);

    res.status(200).json({
      success: true,
      ...results
    });
  } catch (error) {
    next(error);
  }
};

// Get a single book by ID
exports.getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return next(new NotFoundError('Book not found'));
    }
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

// Create a new book
exports.createBook = async (req, res, next) => {
  try {
    // Validate request body against the schema
    const { error, value } = bookSchema.validate(req.body);
    if (error) {
      return next(new ValidationError('Validation Error', error.details[0].message));
    }

    const newBook = await Book.create(value);
    res.status(201).json({ success: true, data: newBook });
  } catch (error) {
    // Handle duplicate key error (from MongoDB)
    if (error.code === 11000) {
      return next(new ValidationError('Validation Error', 'ISBN must be unique.'));
    }
    next(error);
  }
};

// Update a book by ID
exports.updateBook = async (req, res, next) => {
  try {

    // Make all fields optional except the ones that are present in the request body
    const modifiedSchema = validationHelper.makeSchemaFieldsOptional(bookSchema, req.body);

    // Validate request body against the schema (only validate fields that are present in the request body)
    const { error, value } = modifiedSchema.validate(req.body);
    if (error) {
      return next(new ValidationError('Validation Error', error.details[0].message));
    }

    const updatedBook = await Book.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    });
    if (!updatedBook) {
      return next(new NotFoundError('Book not found'));
    }
    res.status(200).json({ success: true, data: updatedBook });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return next(new ValidationError('Validation Error', 'ISBN must be unique.'));
    }
    next(error);
  }
};


// Delete a book by ID
exports.deleteBook = async (req, res, next) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) {
      return next(new NotFoundError('Book not found'));
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
