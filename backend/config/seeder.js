import User from '../models/User.js';
import Swipe from '../models/Swipe.js';
import Match from '../models/Match.js';
import Message from '../models/Message.js';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  try {
    // Check if we already have users in the database
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already has data. Skipping database seeder.');
      return;
    }

    console.log('Seeding database with high-quality mock dating profiles...');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create primary mock users
    const users = await User.insertMany([
      {
        email: 'alex@example.com',
        password: hashedPassword,
        name: 'Alex Mercer',
        age: 26,
        gender: 'male',
        preference: 'female',
        bio: 'Software engineer by day, urban explorer by night. Let\'s find the best coffee spots in town, code together, or get lost in the mountains! ☕🏔️',
        interests: ['Coding', 'Coffee', 'Hiking', 'Photography', 'Indie Rock'],
        photos: [
          { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600' },
          { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600' }
        ],
        location: 'New York, NY',
        isOnline: true,
        lastSeen: new Date()
      },
      {
        email: 'sophia@example.com',
        password: hashedPassword,
        name: 'Sophia Chen',
        age: 24,
        gender: 'female',
        preference: 'male',
        bio: 'Foodie, world traveler, and amateur chef. Seeking someone to share new culinary adventures and travel stories with. Let\'s get tacos! 🌮✈️',
        interests: ['Cooking', 'Travel', 'Tacos', 'Art', 'Yoga'],
        photos: [
          { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600' },
          { url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600' }
        ],
        location: 'New York, NY',
        isOnline: true,
        lastSeen: new Date()
      },
      {
        email: 'emily@example.com',
        password: hashedPassword,
        name: 'Emily Watson',
        age: 25,
        gender: 'female',
        preference: 'male',
        bio: 'Bookworm, museum walker, and vinyl record collector. Looking for deep conversations, concerts in the park, and cozy rainy afternoons. 📚🎵🎨',
        interests: ['Reading', 'Museums', 'Vinyl', 'Concerts', 'Jazz'],
        photos: [
          { url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=600' },
          { url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600' }
        ],
        location: 'New York, NY',
        isOnline: false,
        lastSeen: new Date(Date.now() - 3600000)
      },
      {
        email: 'marcus@example.com',
        password: hashedPassword,
        name: 'Marcus Vance',
        age: 28,
        gender: 'male',
        preference: 'female',
        bio: 'Fitness enthusiast, dog lover, and weekend hiker. If you love early morning jogs, healthy smoothies, and golden retrievers, swipe right! 🐕🏃‍♂️',
        interests: ['Fitness', 'Dogs', 'Hiking', 'Running', 'Healthy Eating'],
        photos: [
          { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600' }
        ],
        location: 'Brooklyn, NY',
        isOnline: false,
        lastSeen: new Date(Date.now() - 7200000)
      },
      {
        email: 'jessica@example.com',
        password: hashedPassword,
        name: 'Jessica Taylor',
        age: 27,
        gender: 'female',
        preference: 'male',
        bio: 'Live music lover, retro fashion enthusiast, and weekend brunch connoisseur. Let\'s explore local flea markets and find the best rooftop bars! 🥂🎸',
        interests: ['Concerts', 'Fashion', 'Brunch', 'Design', 'Cocktails'],
        photos: [
          { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600' }
        ],
        location: 'Queens, NY',
        isOnline: true,
        lastSeen: new Date()
      }
    ]);

    const alex = users[0];
    const sophia = users[1];
    const emily = users[2];
    const marcus = users[3];
    const jessica = users[4];

    console.log('Seeded users list successfully.');

    // 1. Let's seed pre-existing Match & Chat history between Alex and Sophia
    const alexSophiaMatch = await Match.create({
      users: [alex._id, sophia._id]
    });

    // Update user profiles to include match
    alex.matches.push(sophia._id);
    await alex.save();
    sophia.matches.push(alex._id);
    await sophia.save();

    // Create messages between Alex and Sophia
    const message1 = await Message.create({
      matchId: alexSophiaMatch._id,
      sender: sophia._id,
      text: 'Hey Alex! Love your profile, that hike in your photo looks amazing! Where was it taken?',
      createdAt: new Date(Date.now() - 7200000) // 2 hours ago
    });

    const message2 = await Message.create({
      matchId: alexSophiaMatch._id,
      sender: alex._id,
      text: 'Hey Sophia! Thanks, that was at Yosemite! It was a challenging climb but the views are absolutely worth it. Do you hike often?',
      createdAt: new Date(Date.now() - 5400000) // 1.5 hours ago
    });

    const message3 = await Message.create({
      matchId: alexSophiaMatch._id,
      sender: sophia._id,
      text: 'Yes, I try to go whenever I get a free weekend! Yosemite is definitely on my bucket list. 🏔️ Let\'s make plans to go sometime!',
      createdAt: new Date(Date.now() - 3600000) // 1 hour ago
    });

    // Link last message to Match
    alexSophiaMatch.lastMessage = message3._id;
    await alexSophiaMatch.save();

    // 2. Let's seed pre-existing Swipes (likes) to facilitate easy dynamic swiping
    // Emily has liked Alex. If Alex swipes right on Emily, a match will be created instantly!
    await Swipe.create({
      swiper: emily._id,
      swipedUser: alex._id,
      type: 'like'
    });

    // Jessica has liked Alex. If Alex swipes right on Jessica, a match is created!
    await Swipe.create({
      swiper: jessica._id,
      swipedUser: alex._id,
      type: 'like'
    });

    // Sophia has liked Alex (already matched, but let's record the swipes too)
    await Swipe.create({
      swiper: alex._id,
      swipedUser: sophia._id,
      type: 'like'
    });
    await Swipe.create({
      swiper: sophia._id,
      swipedUser: alex._id,
      type: 'like'
    });

    console.log('Seeded Swipe decks & Chat streams successfully!');
    console.log('==================================================');
    console.log('TEST LOGIN CREDENTIALS:');
    console.log('1. User: alex@example.com     Pass: password123 (Alex Mercer)');
    console.log('2. User: sophia@example.com   Pass: password123 (Sophia Chen)');
    console.log('3. User: emily@example.com    Pass: password123 (Emily Watson)');
    console.log('==================================================');

  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
  }
};

export default seedDatabase;
