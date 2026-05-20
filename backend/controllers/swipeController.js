import Swipe from '../models/Swipe.js';
import Match from '../models/Match.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

/**
 * @desc    Perform a swipe gesture (like or dislike)
 * @route   POST /api/swipes
 * @access  Private
 */
export const swipeProfile = async (req, res, next) => {
  try {
    const { swipedUserId, type } = req.body;
    const swiperId = req.user._id;

    if (!['like', 'dislike'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Swipe type must be either like or dislike'
      });
    }

    // Verify user doesn't swipe on themselves
    if (swiperId.toString() === swipedUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot swipe on your own profile'
      });
    }

    // Check if target user exists
    const targetUser = await User.findById(swipedUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // 1. Register Swipe Action
    let swipeRecord;
    try {
      swipeRecord = await Swipe.create({
        swiper: swiperId,
        swipedUser: swipedUserId,
        type
      });
    } catch (dbError) {
      // Handle duplicate swipe index violation
      if (dbError.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'You have already swiped on this profile'
        });
      }
      throw dbError;
    }

    // 2. If Swipe is a Like, Check for Mutual Match
    if (type === 'like') {
      const mutualLike = await Swipe.findOne({
        swiper: swipedUserId,
        swipedUser: swiperId,
        type: 'like'
      });

      if (mutualLike) {
        // Create active Match room
        const match = await Match.create({
          users: [swiperId, swipedUserId]
        });

        // 3. Link matches in User profiles
        await User.findByIdAndUpdate(swiperId, {
          $addToSet: { matches: swipedUserId }
        });
        await User.findByIdAndUpdate(swipedUserId, {
          $addToSet: { matches: swiperId }
        });

        // 4. Create mutual match notifications
        await Notification.create([
          {
            recipient: swiperId,
            sender: swipedUserId,
            type: 'match'
          },
          {
            recipient: swipedUserId,
            sender: swiperId,
            type: 'match'
          }
        ]);

        return res.status(200).json({
          success: true,
          match: true,
          matchDetails: {
            matchId: match._id,
            partner: targetUser
          }
        });
      }
    }

    res.status(200).json({
      success: true,
      match: false
    });
  } catch (error) {
    next(error);
  }
};
