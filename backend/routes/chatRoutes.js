import express from 'express';
import { getMessages, sendMessageRest } from '../controllers/chatController.js';
import { protectRoute } from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const router = express.Router();

router.use(protectRoute);

router.get('/:matchId', getMessages);
router.post('/:matchId', upload.single('image'), sendMessageRest);

export default router;
