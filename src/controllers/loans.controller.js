const Loan = require('../models/loan.model');
const { NotFoundError } = require('../utils/errorHandler');
const paginate = require('../utils/paginationHelper');

// Get all loans
exports.getAllLoans = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filter = {};
    if (req.query.userId) {
      filter.user = req.query.userId;
    }
    if (req.query.bookId) {
      filter.book = req.query.bookId;
    }

    // Date filters 
    if (req.query.borrowedFrom) {
      filter.borrowDate = { $gte: new Date(req.query.borrowedFrom) };
    }
    if (req.query.borrowedTo) {
      if (filter.borrowDate) {
        filter.borrowDate.$lte = new Date(req.query.borrowedTo);
      } else {
        filter.borrowDate = { $lte: new Date(req.query.borrowedTo) };
      }
    }
    if (req.query.dueFrom) {
      filter.returnDate = { $gte: new Date(req.query.dueFrom) };
    }
    if (req.query.dueTo) {
      if (filter.returnDate) {
        filter.returnDate.$lte = new Date(req.query.dueTo);
      } else {
        filter.returnDate = { $lte: new Date(req.query.dueTo) };
      }
    }

    // Use the paginate helper function
    const results = await paginate(Loan, filter, page, limit, populate = [
      { path: 'user', select: 'name' },
      { path: 'book', select: 'title' },
    ]);

    res.status(200).json({
      success: true,
      ...results
    });

  } catch (error) {
    next(error);
  }
};

// Get a single loan by ID
exports.getLoanById = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('user', 'name')
      .populate('book', 'title');
    if (!loan) {
      return next(new NotFoundError('Loan not found'));
    }
    res.status(200).json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};

// Create a new loan
exports.createLoan = async (req, res, next) => {
  try {
    const newLoan = await Loan.create(req.body);
    res.status(201).json({ success: true, data: newLoan });
  } catch (error) {
    next(error);
  }
};

// Update a loan by ID
exports.updateLoan = async (req, res, next) => {
  try {
    const updatedLoan = await Loan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedLoan) {
      return next(new NotFoundError('Loan not found'));
    }
    res.status(200).json({ success: true, data: updatedLoan });
  } catch (error) {
    next(error);
  }
};

// Delete a loan by ID
exports.deleteLoan = async (req, res, next) => {
  try {
    const deletedLoan = await Loan.findByIdAndDelete(req.params.id);
    if (!deletedLoan) {
      return next(new NotFoundError('Loan not found'));
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
