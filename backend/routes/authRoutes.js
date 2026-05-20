import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  getMe,
  firebaseLogin
} from '../controllers/authController.js';
import {
  registerValidator,
  loginValidator
} from '../validators/authValidator.js';
import { protectRoute } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerValidator, registerUser);
router.post('/login', loginValidator, loginUser);
router.post('/logout', logoutUser);
router.post('/refresh', refreshToken);
router.post('/firebase', firebaseLogin);
router.get('/me', protectRoute, getMe);

export default router;
