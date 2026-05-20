import User from '../models/User.js';
import Swipe from '../models/Swipe.js';
import { uploadImage, deleteImage } from '../utils/uploader.js';
import bcrypt from 'bcryptjs';
import Match from '../models/Match.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';

/**
 * @desc    Update current user profile (bio, preferences, interests, location)
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, preference, gender, age, interests, location } = req.body;
    const userId = req.user._id;

    // Find and update profile fields
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...(name && { name }),
          ...(bio !== undefined && { bio }),
          ...(preference && { preference }),
          ...(gender && { gender }),
          ...(age && { age }),
          ...(interests && { interests }),
          ...(location !== undefined && { location })
        }
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload an image and add to user photos array
 * @route   POST /api/users/profile/photos
 * @access  Private
 */
export const addPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No photo provided or file format is unsupported'
      });
    }

    const userId = req.user._id;
    const fileResult = await uploadImage(req.file.path);

    // Save image URL & public ID to user's photo collection
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          photos: {
            url: fileResult.url,
            publicId: fileResult.publicId
          }
        }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a specific photo from user's photos array
 * @route   DELETE /api/users/profile/photos/:photoId
 * @access  Private
 */
export const removePhoto = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { photoId } = req.params;

    // Retrieve user profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Locate target photo
    const photo = user.photos.id(photoId);
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    // Terminate asset in Cloudinary or local uploads folder
    await deleteImage(photo.publicId || photo.url);

    // Pull photo from schema and save
    user.photos.pull({ _id: photoId });
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Photo removed successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate Tinder card deck for the discovery feed
 * @route   GET /api/users/discovery
 * @access  Private
 */
export const getDiscoveryFeed = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const userId = currentUser._id;

    // 1. Fetch profiles swiped by current user
    const swipedRecords = await Swipe.find({ swiper: userId }).select('swipedUser');
    const swipedUserIds = swipedRecords.map(record => record.swipedUser);

    // Always exclude current user from discovery
    const excludeIds = [userId, ...swipedUserIds];

    // 2. Draft preference queries
    const genderQuery = {};
    if (currentUser.preference !== 'both') {
      genderQuery.gender = currentUser.preference;
    }

    // Enforce mutual orientation matching (only suggest users whose preference matches current user's gender or is set to 'both')
    const mutualPreferenceQuery = {
      $or: [
        { preference: 'both' },
        { preference: currentUser.gender }
      ]
    };

    // 3. Construct compound query
    const searchConditions = {
      _id: { $nin: excludeIds },
      showInDiscovery: true,
      ...genderQuery,
      ...mutualPreferenceQuery
    };

    // 4. Fetch discovery candidate profiles
    const discoveryFeed = await User.find(searchConditions)
      .select('-matches') // Exclude heavy relations for performance
      .limit(30);         // Fetch pages of cards for client deck

    res.status(200).json({
      success: true,
      results: discoveryFeed.length,
      feed: discoveryFeed
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch specific user public profile details
 * @route   GET /api/users/:profileId
 * @access  Private
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const { profileId } = req.params;

    const user = await User.findById(profileId).select('-email');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      profile: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change current user password
 * @route   PUT /api/users/profile/password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new passwords' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    // Retrieve user explicitly including password field
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update privacy settings (showInDiscovery status)
 * @route   PUT /api/users/profile/privacy
 * @access  Private
 */
export const updatePrivacySettings = async (req, res, next) => {
  try {
    const { showInDiscovery } = req.body;
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { showInDiscovery: !!showInDiscovery } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Privacy settings updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete current user account & clear data relations
 * @route   DELETE /api/users/profile/account
 * @access  Private
 */
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Delete user photos from storage fallback or Cloudinary
    const user = await User.findById(userId);
    if (user && user.photos && user.photos.length > 0) {
      for (const photo of user.photos) {
        await deleteImage(photo.publicId || photo.url);
      }
    }

    // Delete Swipes associated with this user
    await Swipe.deleteMany({
      $or: [{ swiper: userId }, { swipedUser: userId }]
    });

    // Find and delete Matches associated with this user
    const matches = await Match.find({
      users: userId
    });
    const matchIds = matches.map(m => m._id);

    // Delete all Messages and Notifications in those matches or recipient of notifications
    await Message.deleteMany({ matchId: { $in: matchIds } });
    await Notification.deleteMany({
      $or: [
        { match: { $in: matchIds } },
        { recipient: userId },
        { sender: userId }
      ]
    });

    // Delete Matches themselves
    await Match.deleteMany({ _id: { $in: matchIds } });

    // Delete user profile
    await User.findByIdAndDelete(userId);

    // Clear refresh cookie
    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0),
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    res.status(200).json({
      success: true,
      message: 'Account and associated data deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
