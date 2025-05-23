// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
// const validationMiddleware = require('../middlewares/validationMiddleware'); // Optional: for input validation

// Staff Login Route
router.post('/staff/login', /* Optional: validationMiddleware.validateLogin, */ authController.staffLogin);

// TODO: Add routes for user registration, user login, admin login etc.
// Example: router.post('/user/register', authController.userRegister);
// Example: router.post('/user/login', authController.userLogin);

module.exports = router;
