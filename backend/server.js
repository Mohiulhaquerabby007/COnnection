import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import socketHandler from './sockets/socketHandler.js';
import initFirebaseAdmin from './config/firebaseAdmin.js';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
initFirebaseAdmin();

// Establish Database Connection
connectDB();

// 1. Create HTTP Server
const server = http.createServer(app);

// 2. Initialize Socket.io with HTTP server
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // Match frontend dynamic ports
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000 // Close idle sockets after 60s
});

// 3. Connect Socket event handlers
socketHandler(io);

// 4. Fire up server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`Tinder-Clone Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Server Address: http://localhost:${PORT}`);
  console.log(`Real-Time WebSockets active on ws://localhost:${PORT}`);
  console.log(`===============================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
