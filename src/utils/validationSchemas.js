const Joi = require('joi');

const isbnRegex = new RegExp(/^(?=(?:[^0-9]*[0-9]){10}(?:(?:[^0-9]*[0-9]){3})?$)[\d-]+$/);

const bookSchema = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().required(),
  year: Joi.number().integer().min(1000).max(new Date().getFullYear()).required(),
  isbn: Joi.string().pattern(isbnRegex).required().messages({
    'string.pattern.base': 'ISBN must be a valid ISBN-10 or ISBN-13, e.g. 123-4-56789-123-4 \n see https://www.geeksforgeeks.org/regular-expressions-to-validate-isbn-code/ for more details.',
  }),
});

const loanSchema = Joi.object({
  book: Joi.string().required(),
  user: Joi.string().required(),
  returnDate: Joi.date().required(),
});

const userRegisterSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const userProfileUpdateSchema = Joi.object({
  name: Joi.string().optional(), // Name is optional for update
  email: Joi.string().email().optional(),
}).min(1);

module.exports = {
  bookSchema,
  loanSchema,
  userRegisterSchema,
  userLoginSchema,
  userProfileUpdateSchema,
};

