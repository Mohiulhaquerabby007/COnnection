import { body, validationResult } from 'express-validator';

export const registerValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('age')
    .isInt({ min: 18 })
    .withMessage('You must be at least 18 years old'),
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('preference')
    .isIn(['male', 'female', 'both'])
    .withMessage('Preference must be male, female, or both'),
  
  // Custom middleware to handle validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => err.msg)
      });
    }
    next();
  }
];

export const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
    
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => err.msg)
      });
    }
    next();
  }
];
