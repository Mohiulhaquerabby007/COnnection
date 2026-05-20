import mongoose from 'mongoose';

const SwipeSchema = new mongoose.Schema(
  {
    swiper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Swiper is required'],
      index: true
    },
    swipedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Swiped user is required'],
      index: true
    },
    type: {
      type: String,
      enum: {
        values: ['like', 'dislike'],
        message: 'Swipe type must be either like or dislike'
      },
      required: [true, 'Swipe type is required']
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate swipes from the same user on the same profile
SwipeSchema.index({ swiper: 1, swipedUser: 1 }, { unique: true });

const Swipe = mongoose.model('Swipe', SwipeSchema);
export default Swipe;
