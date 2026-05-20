import Match from '../models/Match.js';
import User from '../models/User.js';
import Message from '../models/Message.js';

/**
 * @desc    Fetch all mutual matches for current user
 * @route   GET /api/matches
 * @access  Private
 */
export const getMatches = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch matches containing current user, populate partner details and last message
    const matches = await Match.find({
      users: { $in: [userId] }
    })
      .populate({
        path: 'users',
        select: 'name age photos isOnline lastSeen'
      })
      .populate({
        path: 'lastMessage',
        select: 'text sender seen createdAt'
      })
      .sort({ updatedAt: -1 });

    // Clean matches list so that the client gets a simple "partner" reference object
    const matchesList = matches.map(match => {
      const partner = match.users.find(
        user => user._id.toString() !== userId.toString()
      );
      
      return {
        _id: match._id,
        partner,
        lastMessage: match.lastMessage,
        createdAt: match.createdAt,
        updatedAt: match.updatedAt
      };
    });

    res.status(200).json({
      success: true,
      matches: matchesList
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Unmatch/Delete a match relationship
 * @route   DELETE /api/matches/:matchId
 * @access  Private
 */
export const unmatchUser = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const userId = req.user._id;

    // Fetch match
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Verify current user belongs to the match
    if (!match.users.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to unmatch this user'
      });
    }

    const partnerId = match.users.find(id => id.toString() !== userId.toString());

    // 1. Delete match document
    await Match.findByIdAndDelete(matchId);

    // 2. Remove mutual user references
    await User.findByIdAndUpdate(userId, { $pull: { matches: partnerId } });
    await User.findByIdAndUpdate(partnerId, { $pull: { matches: userId } });

    // 3. Clear chat logs
    await Message.deleteMany({ matchId });

    res.status(200).json({
      success: true,
      message: 'Unmatched profile successfully'
    });
  } catch (error) {
    next(error);
  }
};
