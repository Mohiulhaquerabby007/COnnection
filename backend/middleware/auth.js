import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protectRoute = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header for Bearer token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Fallback: check cookie if cookies are parsed
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token missing'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user and attach to request context
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User associated with this token no longer exists'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT auth error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'token_expired',
        error: 'Access token expired'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
};
