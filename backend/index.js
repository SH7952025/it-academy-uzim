const express = require('express'); // Backend Restart Triggered
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const sequelize = require('./db');
const apiRoutes = require('./routes/api');
const User = require('./models/User');
const Setting = require('./models/Setting');
const Course = require('./models/Course');
const Lesson = require('./models/Lesson');
const Enrollment = require('./models/Enrollment');
const bcrypt = require('bcryptjs');
const { apiLimiter, sanitizeInput, sqlInjectionGuard, securityHeaders, helmet } = require('./middleware/security');

// Associations
User.hasMany(Enrollment, { foreignKey: 'userId' });
Enrollment.belongsTo(User, { foreignKey: 'userId' });

Course.hasMany(Enrollment, { foreignKey: 'courseId' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId' });

Course.hasMany(Lesson, { foreignKey: 'courseId' });
Lesson.belongsTo(Course, { foreignKey: 'courseId' });

const app = express();

// ==========================================
// 🔒 SECURITY LAYERS
// ==========================================

// Helmet - HTTP security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Frontend uchun ochiq qoldiramiz
}));

// Custom security headers
app.use(securityHeaders);

// CORS - Ruxsat berilgan originlar
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:3000', 
  'http://127.0.0.1:5173'
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ''));
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-bypass'],
  credentials: true,
}));

// Body parser limitlari
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// SQL Injection himoyasi
app.use(sqlInjectionGuard);

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.url} | IP: ${req.ip}`);
  next();
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// VIDEO UCHUN: private_uploads ni TAQIQLASH
// Faqat /api/videos/:filename orqali tokenli kirish
// ==========================================
// MUHIM: private_uploads papkasiga to'g'ridan-to'g'ri kirish TAQIQLANADI

// Routes
app.get('/', (req, res) => res.send('Backend is running'));
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint topilmadi' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server xatosi:', err);
  
  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'Fayl hajmi juda katta (max 500MB)' });
  }
  
  console.error("Global Error Handler caught:", err);
  res.status(500).json({ message: 'Server xatosi yuz berdi', error: err.message, stack: err.stack });
});

const PORT = process.env.PORT || 5001;

sequelize.authenticate().then(async () => {
  console.log('Database connected successfully.');
  await sequelize.sync({ alter: true });
  console.log('Database synced');
  
  // Seed admin user if no admin exists in the system at all
  const adminExists = await User.findOne({ where: { role: 'admin' } });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({ 
      username: 'admin', 
      password: hashedPassword, 
      role: 'admin', 
      fullName: 'Super Admin',
      email: 'admin@gmail.com'
    });
    console.log('Default admin created: admin / admin123 (email: admin@gmail.com)');
  }

  // Seed default settings
  const defaultSettings = [
    { key: 'phone', value: '+998 90 123 45 67' },
    { key: 'email', value: 'info@it.uz' },
    { key: 'address', value: 'Toshkent sh., Yunusobod tumani' },
    { key: 'map_url', value: 'https://www.google.com/maps/embed?pb=...' }
  ];

  for (const s of defaultSettings) {
    const exists = await Setting.findByPk(s.key);
    if (!exists) {
      await Setting.create(s);
    }
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`🔒 Security: Helmet, Rate Limiting, XSS Protection, SQL Injection Guard FAOL`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use.`);
    } else {
      console.error('❌ Server error:', err);
    }
    process.exit(1);
  });
}).catch(err => {
  console.error('Error syncing database:', err);
});
