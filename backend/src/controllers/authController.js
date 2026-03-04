const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET || 'wellnesswave_dev_secret',
    { expiresIn: '7d' }
  );
};

const buildUsernameBase = (name, email) => {
  const preferred = (name || email || 'user').toLowerCase();
  const sanitized = preferred.replace(/[^a-z0-9]/g, '');

  if (sanitized.length >= 3) {
    return sanitized;
  }

  return `user${Math.random().toString(36).slice(2, 8)}`;
};

const generateUniqueUsername = async (name, email) => {
  const base = buildUsernameBase(name, email);

  for (let index = 0; index < 20; index += 1) {
    const candidate = index === 0 ? base : `${base}${index}`;
    const exists = await User.findOne({ username: candidate }).select('_id');

    if (!exists) {
      return candidate;
    }
  }

  return `user${Date.now()}`;
};

const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    const normalizedUsername = String(username).trim();

    if (normalizedUsername.length < 3 || String(password).length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Username must be at least 3 characters and password at least 6 characters'
      });
    }

    const existingUser = await User.findOne({ username: normalizedUsername });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Username already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      username: normalizedUsername,
      password: hashedPassword
    });

    const token = createToken(user);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to register user',
      message: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    const normalizedUsername = String(username).trim();
    const user = await User.findOne({ username: normalizedUsername });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }

    const isPasswordMatch = await bcrypt.compare(String(password), user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to login',
      message: error.message
    });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('_id username');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile',
      message: error.message
    });
  }
};

const googleLogin = async (req, res) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        error: 'Google authentication is not configured'
      });
    }

    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'Google ID token is required'
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload?.sub || !payload?.email) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Google token payload'
      });
    }

    let user = await User.findOne({ googleId: payload.sub });

    if (!user) {
      user = await User.findOne({ email: payload.email.toLowerCase() });
    }

    if (!user) {
      const username = await generateUniqueUsername(payload.name, payload.email);
      user = await User.create({
        username,
        googleId: payload.sub,
        email: payload.email.toLowerCase(),
        password: undefined
      });
    } else {
      user.googleId = user.googleId || payload.sub;
      user.email = (payload.email || user.email || '').toLowerCase();
      await user.save();
    }

    const token = createToken(user);

    return res.status(200).json({
      success: true,
      message: 'Google login successful',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username
        }
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Google authentication failed',
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  me,
  googleLogin
};
