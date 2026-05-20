import express from 'express';
import { swipeProfile } from '../controllers/swipeController.js';
import { protectRoute } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protectRoute, swipeProfile);

export default router;
