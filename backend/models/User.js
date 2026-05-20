import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Exclude from queries by default for safety
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [18, 'You must be at least 18 years old to register']
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: ['male', 'female', 'other'],
        message: '{VALUE} is not a valid gender'
      }
    },
    preference: {
      type: String,
      required: [true, 'Dating preference is required'],
      enum: {
        values: ['male', 'female', 'both'],
        message: '{VALUE} is not a valid preference'
      }
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: ''
    },
    interests: {
      type: [String],
      default: []
    },
    photos: {
      type: [
        {
          url: { type: String, required: true },
          publicId: { type: String, default: null } // Optional Cloudinary reference
        }
      ],
      default: []
    },
    location: {
      type: String,
      default: ''
    },
    matches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    isOnline: {
      type: Boolean,
      default: false
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    showInDiscovery: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', UserSchema);
export default User;
