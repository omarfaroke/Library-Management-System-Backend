const Loan = require('../models/loan.model');
const { NotFoundError } = require('../utils/errorHandler');

// Get all loans
exports.getAllLoans = async (req, res, next) => {
  try {
    const loans = await Loan.find().populate('user', 'name').populate('book', 'title');
    res.status(200).json({ success: true, data: loans });
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