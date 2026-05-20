import mongoose from 'mongoose';

const MatchSchema = new mongoose.Schema(
  {
    users: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      ],
      validate: [
        (val) => val.length === 2,
        'A match must contain exactly 2 users'
      ],
      required: true
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index the users array to quickly look up matches a user belongs to
MatchSchema.index({ users: 1 });

const Match = mongoose.model('Match', MatchSchema);
export default Match;
