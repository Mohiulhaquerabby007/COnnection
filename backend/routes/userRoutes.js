import express from 'express';
import {
  updateProfile,
  addPhoto,
  removePhoto,
  getDiscoveryFeed,
  getUserProfile,
  changePassword,
  updatePrivacySettings,
  deleteAccount
} from '../controllers/userController.js';
import { protectRoute } from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// All user actions are protected
router.use(protectRoute);

router.put('/profile', updateProfile);
router.post('/profile/photos', upload.single('photo'), addPhoto);
router.delete('/profile/photos/:photoId', removePhoto);
router.get('/discovery', getDiscoveryFeed);
router.put('/profile/password', changePassword);
router.put('/profile/privacy', updatePrivacySettings);
router.delete('/profile/account', deleteAccount);
router.get('/:profileId', getUserProfile);

export default router;
