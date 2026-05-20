import Message from '../models/Message.js';
import Match from '../models/Match.js';
import { uploadImage } from '../utils/uploader.js';

/**
 * @desc    Get historical chat messages for a match room
 * @route   GET /api/messages/:matchId
 * @access  Private
 */
export const getMessages = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const userId = req.user._id;

    // Verify user belongs to the match
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    if (!match.users.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this chat history'
      });
    }

    // Mark partner's messages as read in this room
    await Message.updateMany(
      { matchId, sender: { $ne: userId }, seen: false },
      { $set: { seen: true, seenAt: new Date() } }
    );

    // Fetch messages sorted chronologically
    const messages = await Message.find({ matchId }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send a message (text or image) - fallback REST route
 * @route   POST /api/messages/:matchId
 * @access  Private
 */
export const sendMessageRest = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const { text } = req.body;
    const senderId = req.user._id;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    if (!match.users.includes(senderId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to send messages to this room'
      });
    }

    let imageUrl = '';
    if (req.file) {
      const uploadResult = await uploadImage(req.file.path);
      imageUrl = uploadResult.url;
    }

    if (!text && !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty (must contain text or image)'
      });
    }

    // Create message document
    const message = await Message.create({
      matchId,
      sender: senderId,
      text: text || '',
      image: imageUrl
    });

    // Update match's lastMessage reference pointer
    match.lastMessage = message._id;
    await match.save();

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    next(error);
  }
};
