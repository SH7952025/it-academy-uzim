// ==========================================
// 🔒 SECURITY MIDDLEWARE
// Barcha kiber hujumlarga qarshi himoya
// ==========================================

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// ---- RATE LIMITING ----

// Umumiy API uchun
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  max: 300, 
  message: { message: 'Juda ko\'p so\'rov yubordingiz, 15 daqiqadan keyin urinib ko\'ring' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Adminlar uchun cheklovni olib tashlash
    return req.headers['x-admin-bypass'] === 'true' || (req.user && req.user.role === 'admin');
  }
});

// Login uchun kuchaytirilgan rate limiting (brute force himoyasi)
// USER REQUEST: 5 marta noto'g'ri bo'lsa 5 daqiqa blok
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 daqiqa
  max: 5, // 5 ta urinish
  message: { message: 'Xavfsizlik tizimi: 5 marta noto\'g\'ri urinish bo\'ldi. 5 daqiqadan keyin qayta urinib ko\'ring.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Muvaffaqiyatli loginlarni hisoblamaslik
  skip: (req) => {
    // Adminlar test jarayonida bloklanib qolmasligi uchun
    return req.headers['x-admin-bypass'] === 'true';
  }
});

// Register uchun rate limiting
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 soat
  max: 5, 
  message: { message: 'Juda ko\'p ro\'yxatdan o\'tish urinishi. 1 soatdan keyin qayta urinib ko\'ring' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ---- INPUT SANITIZATION (XSS PROTECTION) ----
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // XSS himoyasi - HTML taglarni butunlay tozalash yoki escape qilish
        cleaned[key] = value
          .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, "") // Scriptlarni o'chirish
          .replace(/<[^>]*>?/gm, '') // Barcha HTML taglarni o'chirish (Commentlar, News va h.k. uchun controllerda ruxsat beramiz)
          .trim();
        
        // Maxsus maydonlar uchun ruxsat berish (Password, URL)
        if (key.toLowerCase().includes('password') || key.toLowerCase().includes('url') || key === 'content' || key === 'description' || key.toLowerCase().includes('image')) {
          cleaned[key] = value; 
        }
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  };

  if (req.body) req.body = sanitize(req.body);
  next();
};

// ---- SQL INJECTION GUARD ----
const sqlInjectionGuard = (req, res, next) => {
  const dangerousPatterns = /('|--|;|\/\*|\*\/|xp_|exec|execute|union|select|insert|update|delete|drop|truncate|alter)/i;
  
  const hasInfection = (data) => {
    if (!data) return false;
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    return dangerousPatterns.test(str);
  };

  if (hasInfection(req.query) || hasInfection(req.params)) {
    return res.status(400).json({ message: 'Xavfsizlik: Noto\'g\'ri so\'rov parametrlari topildi.' });
  }

  next();
};

// ---- SECURITY HEADERS ----
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  next();
};

module.exports = {
  apiLimiter,
  loginLimiter,
  registerLimiter,
  contactLimiter: registerLimiter, // Reusing similar logic
  videoLimiter: apiLimiter, 
  sanitizeInput,
  sqlInjectionGuard,
  adminOnly: (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Ruxsat yo\'q' });
    next();
  },
  securityHeaders,
  helmet,
};
