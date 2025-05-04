const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');

// ==========================
// 🌍 Load Environment Variables
// ==========================
dotenv.config();
console.log('✅ Environment Variables Loaded');

if (!process.env.JWT_SECRET || !process.env.SESSION_SECRET) {
  console.error('❌ Missing JWT_SECRET or SESSION_SECRET');
  process.exit(1);
}

// ==========================
// 🔌 MongoDB Connection
// ==========================
connectDB();

// ==========================
// 🚀 Initialize App
// ==========================
const app = express();

// ==========================
// 🔐 Passport Strategies
// ==========================
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, { id }));

// GitHub OAuth
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email'],
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, {
        id: profile.id,
        username: profile.username,
        email: profile.emails?.[0]?.value || '',
      });
    }
  )
);

// ==========================
// 🧩 Middlewares
// ==========================
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Use true if using HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ==========================
// 🔐 OAuth Token Handler
// ==========================
const generateJWTAndRedirect = (user, res) => {
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const redirectURL = `${
    process.env.FRONTEND_URL || 'http://localhost:3000'
  }/login?token=${token}`;
  res.redirect(redirectURL);
};

// ==========================
// 🔗 OAuth Routes
// ==========================
app.get('/auth/github', passport.authenticate('github'));
app.get(
  '/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/login',
    session: false,
  }),
  (req, res) => generateJWTAndRedirect(req.user, res)
);

// ==========================
// 📦 API Routes
// ==========================
app.use('/auth', require('./routes/authRoutes')); // Shared auth
app.use('/api/users', require('./routes/userRoutes')); // Admin user management
app.use('/api/customers', require('./routes/customerRoutes')); // Admin & customer routes
app.use('/api/customers/auth', require('./routes/customerAuthRoutes')); // Customer-only auth
app.use('/api/email', require('./routes/emailRoutes')); // Email sending
app.use('/api/reports', require('./routes/reportRoutes')); // Reports
app.use('/api/finance', require('./routes/financeRoutes')); // Finance
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
// ==========================
// ❤️ Healthcheck
// ==========================
app.get('/', (req, res) => {
  res.send('🚀 API is running...');
});

// ==========================
// ❌ 404 Handler
// ==========================
app.use((req, res, next) => {
  console.error(`❌ Route Not Found: ${req.originalUrl}`);
  res.status(404).json({ error: '❌ API Route Not Found' });
});

// ==========================
// 💥 Global Error Handler
// ==========================
app.use((err, req, res, next) => {
  console.error('❌ ERROR:', err.stack || err.message);
  res.status(500).json({ error: '❌ Internal Server Error' });
});

// ==========================
// 🟢 Start Server
// ==========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// ==========================
// 🚨 Graceful Shutdown
// ==========================
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});
