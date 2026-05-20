import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: [true, 'Match ID is required'],
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
      index: true
    },
    text: {
      type: String,
      trim: true,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    seen: {
      type: Boolean,
      default: false
    },
    seenAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index to quickly fetch sorted messages for a match room
MessageSchema.index({ matchId: 1, createdAt: 1 });

const Message = mongoose.model('Message', MessageSchema);
export default Message;
