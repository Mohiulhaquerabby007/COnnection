import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Match from '../models/Match.js';

// Online users map: key = userId, value = socketId
export const onlineUsers = new Map();

const socketHandler = (io) => {
  // Middleware to authenticate socket connections using JWT
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Fetch user profile
      const user = await User.findById(decoded.id).select('_id name matches');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error('Socket authentication error:', err.message);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    console.log(`User connected: ${socket.user.name} (${userId})`);

    // Register active user socket session mapping
    onlineUsers.set(userId, socket.id);

    // 1. Mark user as Online in DB & update lastSeen
    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      lastSeen: new Date()
    });

    // Notify all active match partners of online state transition
    socket.user.matches.forEach((partnerId) => {
      const partnerSocketId = onlineUsers.get(partnerId.toString());
      if (partnerSocketId) {
        io.to(partnerSocketId).emit('partner_status_change', {
          userId,
          isOnline: true
        });
      }
    });

    // 2. Join specific Match conversation rooms
    socket.on('join_match_room', ({ matchId }) => {
      socket.join(matchId);
      console.log(`Socket ${socket.id} joined room: ${matchId}`);
    });

    // 3. Real-time text message relay
    socket.on('send_message', async ({ matchId, text, image }) => {
      try {
        const senderId = socket.user._id;

        // Persist message record to database
        const message = await Message.create({
          matchId,
          sender: senderId,
          text: text || '',
          image: image || '',
          seen: false
        });

        // Update match's lastMessage reference pointer
        const match = await Match.findByIdAndUpdate(
          matchId,
          { lastMessage: message._id },
          { new: true }
        );

        // Deliver message to both room members
        io.to(matchId).emit('receive_message', message);

        // Fetch partner ID to send out match/message push alert if not inside room
        const partnerId = match.users
          .find((id) => id.toString() !== senderId.toString())
          .toString();

        const partnerSocketId = onlineUsers.get(partnerId);
        if (partnerSocketId) {
          // Check if partner is currently in the room before sending alert
          const clientsInRoom = io.sockets.adapter.rooms.get(matchId);
          const isPartnerInRoom = clientsInRoom && clientsInRoom.has(partnerSocketId);

          if (!isPartnerInRoom) {
            io.to(partnerSocketId).emit('new_message_alert', {
              matchId,
              message: {
                _id: message._id,
                text: message.text,
                senderName: socket.user.name,
                createdAt: message.createdAt
              }
            });
          }
        }
      } catch (err) {
        console.error('Socket send_message error:', err.message);
        socket.emit('message_error', { message: 'Failed to send message' });
      }
    });

    // 4. Typing Status Indicators
    socket.on('typing_status', ({ matchId, isTyping }) => {
      socket.to(matchId).emit('typing_status', {
        senderId: userId,
        isTyping
      });
    });

    // 5. Message Seen receipts
    socket.on('message_seen', async ({ matchId }) => {
      try {
        const partnerId = userId;
        
        // Mark all messages from the other user in this room as seen
        await Message.updateMany(
          { matchId, sender: { $ne: partnerId }, seen: false },
          { $set: { seen: true, seenAt: new Date() } }
        );

        // Notify room members of seen updates
        socket.to(matchId).emit('message_seen', { matchId });
      } catch (err) {
        console.error('Socket message_seen error:', err.message);
      }
    });

    // 6. User disconnect handling
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.name} (${userId})`);
      
      // Clear socket session mapping
      onlineUsers.delete(userId);

      // Set user as offline in database
      const disconnectTime = new Date();
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: disconnectTime
      });

      // Broadcast offline status update to matches
      socket.user.matches.forEach((partnerId) => {
        const partnerSocketId = onlineUsers.get(partnerId.toString());
        if (partnerSocketId) {
          io.to(partnerSocketId).emit('partner_status_change', {
            userId,
            isOnline: false,
            lastSeen: disconnectTime
          });
        }
      });
    });
  });
};

export default socketHandler;
