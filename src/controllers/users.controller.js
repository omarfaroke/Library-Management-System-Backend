const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ValidationError, UnauthorizedError } = require('../utils/errorHandler');
const {
  userRegisterSchema,
  userLoginSchema,
  userProfileUpdateSchema
} = require('../utils/validationSchemas');

// Register a new user
exports.registerUser = async (req, res, next) => {
  try {
    const { error, value } = userRegisterSchema.validate(req.body);
    if (error) {
      return next(new ValidationError('Validation Error', error.details[0].message));
    }

    const { name, email, password } = value;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ValidationError('Email is already in use.'));
    }

    const newUser = await User.create({ name, email, password });
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });
    res.status(201).json({ success: true, token: token });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.loginUser = async (req, res, next) => {
  try {
    const { error, value } = userLoginSchema.validate(req.body);
    if (error) {
      return next(new ValidationError('Validation Error', error.details[0].message));
    }

    const { email, password } = value;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new UnauthorizedError('Invalid credentials.'));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new UnauthorizedError('Invalid credentials.'));
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });

    res.status(200).json({ success: true, token: token });
  } catch (error) {
    next(error);
  }
};

// Get current user's profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return next(new NotFoundError('User not found.'));
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// Update user's profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { error, value } = userProfileUpdateSchema.validate(req.body);
    if (error) {
      return next(new ValidationError('Validation Error', error.details[0].message));
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      value,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return next(new NotFoundError('User not found.'));
    }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

