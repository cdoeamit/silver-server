const express = require('express');
const router = express.Router();
const { validateSignup, validateLogin } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const {
  signup,
  login,
  logout,
  refreshAccessToken,
  getProfile
} = require('../controllers/authController');

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.post('/refresh', refreshAccessToken);
router.get('/profile', authenticate, getProfile);

module.exports = router;