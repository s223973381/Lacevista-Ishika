require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const session = require('express-session');
const http = require('http');
const socketIO = require('socket.io');



// Route imports
const pagesRoutes = require('./routes/pagesRoutes');
const authRoutes = require('./routes/authRoutes');
const shopRoutes = require('./routes/shopRoutes');
const cartRoutes = require('./routes/cartRoutes');
const cartController = require('./controllers/cartController');
const orderRoutes = require('./routes/orderRoutes');
const checkoutRoutes = require('./routes/checkout');
const chatBotRoutes = require('./routes/chatBotRoute');
const router = express.Router();

// Session setup
app.use(session({
  secret: 'LaceVista@2025',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
console.log('Connecting to MongoDB at:', process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://ishikamandal0310:YtHFXjuQEbiqN7CU@cluster0.vv1gbjz.mongodb.net/LaceVista-Ishika')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Home page route
router.get('/', cartController.getHomePage);
module.exports = router;

// Middleware to inject cart count
app.use(async (req, res, next) => {
  if (!req.user) {
    res.locals.cartCount = 0;
    return next();
  }

  try {
    const cart = await Cart.findOne({ userId: req.session.userId });
    res.locals.cartCount = cart
      ? cart.items.reduce((total, item) => total + item.qty, 0)
      : 0;
  } catch (err) {
    console.error('Cart count middleware error:', err);
    res.locals.cartCount = 0;
  }
  next();
});

// Route mounting
app.use('/', authRoutes);
app.use('/', shopRoutes);
app.use('/', cartRoutes);
app.use('/', pagesRoutes);
app.use('/', orderRoutes);
app.use('/', checkoutRoutes);
app.use('/api', chatBotRoutes);

// ✅ Step 3: Embed Your Identity (New Route)
app.get('/api/student', (req, res) => {
  res.json({
    name: 'Ishika Mandal',       // 🔁 Replace this with your actual full name
    studentId: '223973381'    // 🔁 Replace this with your actual student ID
  });
});

// Create and run server
const server = http.createServer(app);
const io = socketIO(server);
app.set('io', io);

server.listen(3000, () => console.log('Socket Server running on port 3000'));

// Prevent duplicate server in test mode
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}
