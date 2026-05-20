import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required']
    },
    type: {
      type: String,
      enum: {
        values: ['match', 'message'],
        message: 'Notification type must be match or message'
      },
      required: [true, 'Notification type is required']
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index to quickly fetch unread notifications for a user
NotificationSchema.index({ recipient: 1, read: 1 });

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
