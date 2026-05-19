const jwt = require('jsonwebtoken');
const Session = require('../models/Session');
const crypto = require('crypto');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || req.query.token;

  if (!token) return res.status(401).json({ message: 'Token topilmadi' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    if (decoded.role === 'student') {
      // Eslatma: Mobil qurilmalarda (masalan, iOS Safari dagi AVPlayer/AppleCoreMedia) 
      // videolarni oqimli yuklashda User-Agent o'zgarib ketadi. Shu sababli sessiyani token bo'yicha tekshiramiz.
      const session = await Session.findOne({ 
        where: { userId: decoded.id, token: token } 
      });

      if (!session) {
        return res.status(401).json({ message: 'Sessiya muddati tugagan yoki qurilma bloklangan' });
      }
      
      session.lastActive = new Date();
      await session.save();
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token yaroqsiz' });
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || req.query.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (e) {}
  }
  next();
};

module.exports = authMiddleware;
module.exports.optionalAuth = optionalAuth;
