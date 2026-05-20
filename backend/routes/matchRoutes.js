import express from 'express';
import { getMatches, unmatchUser } from '../controllers/matchController.js';
import { protectRoute } from '../middleware/auth.js';

const router = express.Router();

router.use(protectRoute);

router.get('/', getMatches);
router.delete('/:matchId', unmatchUser);

export default router;
