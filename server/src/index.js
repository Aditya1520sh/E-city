const express = require('express');
const path = require('path');
const fs = require('fs');

const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const session = require('express-session');
const passport = require('passport');

// -------------------- ENV LOADING (LOCAL DEV) -------------------- //
// On Render, env vars aayenge dashboard se.
// Locally run karte time .env / server/.env load ho jayega.
const serverEnv = path.join(__dirname, '../.env');
if (fs.existsSync(serverEnv)) {
    require('dotenv').config({ path: serverEnv });
} else if (fs.existsSync(path.join(__dirname, '.env'))) {
    require('dotenv').config({ path: path.join(__dirname, '.env') });
} else {
    require('dotenv').config();
}

// -------------------- IMPORT INTERNAL MODULES -------------------- //
const prisma = require('./config/prisma');
const issueRoutes = require('./routes/issues');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const announcementRoutes = require('./routes/announcements');
const locationRoutes = require('./routes/locations');
const userRoutes = require('./routes/users');
const settingRoutes = require('./routes/settings');
const departmentRoutes = require('./routes/departments');
const uploadRoutes = require('./routes/uploadRoutes');
const { startEventScheduler } = require('./services/eventScheduler');

const app = express();
const PORT = process.env.PORT || 3000;

// -------------------- SCHEDULER -------------------- //
// Render pe yeh normal Node server hai, so scheduler chalta reh sakta hai.
startEventScheduler(24);

// -------------------- SECURITY HEADERS -------------------- //
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
}));

// -------------------- CORS CONFIG -------------------- //
// IMPORTANT: CLIENT_URL ko Render env me set kar:
// CLIENT_URL=https://e-city.vercel.app
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://e-city.vercel.app',
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            // Mobile apps / curl / server-to-server (no origin)
            if (!origin) return callback(null, true);

            // Allow all Vercel preview/production deployments + main domain
            if (origin.endsWith('.vercel.app')) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            if (process.env.NODE_ENV === 'production') {
                console.warn(`CORS: Rejected request from unauthorized origin: ${origin}`);
                return callback(new Error('Not allowed by CORS'));
            } else {
                console.log(`CORS (dev): Allowing origin: ${origin}`);
                return callback(null, true);
            }
        },
        credentials: true,
    })
);

// -------------------- RATE LIMITING -------------------- //
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// -------------------- SESSION + PASSPORT -------------------- //
const SESSION_SECRET = process.env.SESSION_SECRET;

if (SESSION_SECRET) {
    app.use(
        session({
            secret: SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: { secure: process.env.NODE_ENV === 'production' },
        })
    );
    app.use(passport.initialize());
    app.use(passport.session());
} else {
    console.warn(
        'WARNING: SESSION_SECRET not set - using stateless auth only (no sessions).'
    );
    app.use(passport.initialize());
}

// General rate limit on all routes
app.use(generalLimiter);

// -------------------- HEALTH CHECK -------------------- //
app.get('/api/health', async (req, res) => {
    try {
        const ping = await prisma.$runCommandRaw({ ping: 1 });

        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            env: {
                hasDatabase: !!process.env.DATABASE_URL,
                hasJWT: !!process.env.JWT_SECRET,
                nodeEnv: process.env.NODE_ENV,
            },
            db: ping?.ok === 1 ? 'up' : 'unknown',
            uptime: process.uptime(),
        });
    } catch (err) {
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            env: {
                hasDatabase: !!process.env.DATABASE_URL,
                hasJWT: !!process.env.JWT_SECRET,
                nodeEnv: process.env.NODE_ENV,
            },
            db: 'down',
            uptime: process.uptime(),
            error: err.message,
        });
    }
});

// -------------------- STATIC UPLOADS -------------------- //
// Render me normal folder use kar sakte ho (ephemeral but OK).
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// -------------------- ROUTES -------------------- //
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/upload', uploadRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('E-City API is running');
});

// -------------------- ERROR HANDLER -------------------- //
app.use((err, req, res, next) => {
    console.error(err.stack);

    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res
                .status(400)
                .json({ error: 'File size too large. Maximum 5MB allowed.' });
        }
        return res.status(400).json({ error: err.message });
    }

    if (err.message && err.message.includes('Only image files')) {
        return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: 'Internal server error' });
});

// -------------------- START SERVER -------------------- //
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
