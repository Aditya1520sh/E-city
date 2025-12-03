const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('../config/prisma');

const router = express.Router();

// Check JWT_SECRET is configured
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ CRITICAL: JWT_SECRET environment variable is not set');
  console.error('Authentication endpoints will return 503 errors');
  console.error('Please set JWT_SECRET in environment variables');
}

// Configure Google OAuth Strategy (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback"
  },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await prisma.user.findUnique({
          where: { email: profile.emails[0].value }
        });

        if (!user) {
          // Create new user if doesn't exist
          user = await prisma.user.create({
            data: {
              email: profile.emails[0].value,
              name: profile.displayName,
              role: 'citizen',
              password: '', // No password for OAuth users
              googleId: profile.id,
              avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null
            }
          });
        } else if (!user.googleId) {
          // Update existing user with Google ID
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId: profile.id,
              avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : user.avatar
            }
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  ));
} else {
  console.log('⚠️  Google OAuth not configured - Google login will be disabled');
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Validation middleware
const validateRegister = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 4 }).withMessage('Password must be at least 4 characters'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('role').optional().isIn(['citizen', 'admin']).withMessage('Invalid role')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

router.post('/register', validateRegister, async (req, res) => {
  if (!JWT_SECRET) {
    return res.status(503).json({ error: 'Authentication service not configured. Please contact administrator.' });
  }
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { email, password, name, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'citizen'
      }
    });
    res.json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'User already exists or error creating user' });
  }
});

router.post('/login', validateLogin, async (req, res) => {
  if (!JWT_SECRET) {
    return res.status(503).json({ error: 'Authentication service not configured. Please contact administrator.' });
  }
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { email, password } = req.body;
  try {
    console.log(`[LOGIN] Attempting login for email: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    console.log(`[LOGIN] User found: ${!!user}`);
    if (!user) {
      console.log(`[LOGIN] No user found for email: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log(`[LOGIN] User details - Role: ${user.role}, Has password: ${!!user.password}`);

    const validPassword = await bcrypt.compare(password, user.password);
    console.log(`[LOGIN] Password validation result: ${validPassword}`);

    if (!validPassword) {
      // TEMPORARY: Allow plain text password fallback during migration period
      // TODO: Remove this after all passwords are hashed in database
      if (user.password === password) {
        console.warn('⚠️ WARNING: Plain text password used - please hash database passwords ASAP!');
        console.warn(`User: ${user.email} is using plain text password`);
      } else {
        console.log(`[LOGIN] Invalid password for user: ${email}`);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    console.log(`[LOGIN] Login successful for: ${email}`);
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('[LOGIN ERROR] Full error details:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error object:', JSON.stringify(error, null, 2));
    res.status(500).json({
      error: 'Login failed',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

// Google OAuth routes
// Google OAuth entry point (session disabled for serverless environment)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
  );
} else {
  // Provide a clear API response instead of silent failure when not configured
  router.get('/google', (req, res) => {
    return res.status(503).json({ error: 'Google OAuth not configured on server' });
  });
}

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, role: req.user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Redirect to frontend with token
    const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientURL}/auth/google/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      avatar: req.user.avatar
    }))}`);
  }
);

module.exports = router;
