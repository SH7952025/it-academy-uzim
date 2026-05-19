const User = require('../models/User');
const Session = require('../models/Session');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const crypto = require('crypto');

exports.login = async (req, res) => {
  const { username, phone, password, deviceInfo } = req.body;
  const userAgent = req.headers['user-agent'] || 'Unknown Device';
  
  // Soddalashtirilgan Device ID (Browser + IP yoki ixtiyoriy fingerprint)
  // Haqiqiy productionda frontenddan UUID kelishi yaxshi
  const deviceFingerprint = crypto.createHash('md5').update(userAgent + req.ip).digest('hex');

  try {
    const user = await User.findOne({ 
      where: {
        [Op.or]: [
          username ? { username } : null,
          phone ? { phone } : null
        ].filter(Boolean)
      } 
    });

    if (!user) return res.status(401).json({ message: 'Ma\'lumotlar noto\'g\'ri' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Ma\'lumotlar noto\'g\'ri' });

    // 🔒 DEVICE LIMIT CHECK (Barcha foydalanuvchilar, shu jumladan Admin uchun)
    const activeSessions = await Session.findAll({ where: { userId: user.id } });
    const currentDeviceSession = activeSessions.find(s => s.deviceId === deviceFingerprint);
    
    if (!currentDeviceSession && activeSessions.length >= 2) {
      return res.status(403).json({ 
        message: 'Siz allaqachon 2 ta qurilmadan kirgansiz. Kirish uchun avvalgi qurilmalardan birini o\'chirishingiz kerak.',
        code: 'DEVICE_LIMIT_REACHED',
        sessions: activeSessions.map(s => ({
          id: s.id,
          deviceInfo: s.deviceInfo,
          lastActive: s.lastActive
        }))
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, fullName: user.fullName }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Sessiyani saqlash yoki yangilash
    await Session.upsert({
      userId: user.id,
      deviceId: deviceFingerprint,
      deviceInfo: deviceInfo || userAgent,
      token: token,
      lastActive: new Date()
    });

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        phone: user.phone, 
        fullName: user.fullName,
        role: user.role 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Kirishda xatolik', error: error.message });
  }
};

exports.register = async (req, res) => {
  const { fullName, phone, password, username } = req.body;
  try {
    if (!fullName || fullName.length < 2) return res.status(400).json({ message: 'Ism juda qisqa' });
    if (!phone || phone.length < 9) return res.status(400).json({ message: 'Telefon noto\'g\'ri' });
    if (!password || password.length < 6) return res.status(400).json({ message: 'Parol kamida 6 belgili bo\'lsin' });

    const existingUser = await User.findOne({ 
      where: { [Op.or]: [phone ? { phone } : null, username ? { username } : null].filter(Boolean) }
    });

    if (existingUser) return res.status(400).json({ message: 'Ushbu telefon yoki login band' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ 
      fullName, phone, 
      username: username || `user_${Date.now()}`,
      password: hashedPassword,
      role: 'student'
    });

    const token = jwt.sign({ id: user.id, role: user.role, fullName: user.fullName }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ message: 'Ro\'yxatdan o\'tdingiz', token, user: { id: user.id, fullName: user.fullName, phone: user.phone, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Xatolik', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    res.json(user);
  } catch (error) { res.status(500).json({ message: 'Xatolik' }); }
};

exports.logout = async (req, res) => {
  try {
    const userAgent = req.headers['user-agent'] || 'Unknown Device';
    const deviceFingerprint = crypto.createHash('md5').update(userAgent + req.ip).digest('hex');
    await Session.destroy({ where: { userId: req.user.id, deviceId: deviceFingerprint } });
    res.json({ message: 'Chiqildi' });
  } catch (error) { res.status(500).json({ message: 'Xatolik' }); }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ 
      where: req.query.role ? { role: req.query.role } : {},
      attributes: { exclude: ['password'] } 
    });
    res.json(users);
  } catch (error) { res.status(500).json({ message: 'Xatolik' }); }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    
    // Foydalanuvchini o'chirish
    // Eslatma: Enrollments va Sessions modellarida userId ga ForeignKey qo'yilganligi sababli,
    // o'chirilgan foydalanuvchining barcha sessiyalari va kursga yozilishlari ham o'chib ketishi uchun maxsus destroy ishlatamiz.
    await Session.destroy({ where: { userId: user.id } });
    const Enrollment = require('../models/Enrollment');
    await Enrollment.destroy({ where: { userId: user.id } });
    
    await user.destroy();
    res.json({ message: 'Foydalanuvchi butunlay o\'chirildi va tizimdan chiqarib yuborildi' });
  } catch (error) { 
    console.error("DELETE USER ERROR:", error);
    res.status(500).json({ message: 'O\'chirishda xatolik', error: error.message }); 
  }
};

// 🔒 O'z profilini tahrirlash (Username, Email va Parol)
exports.updateMyProfile = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Topilmadi' });

    if (username) {
      const existing = await User.findOne({ where: { username, id: { [Op.ne]: user.id } } });
      if (existing) return res.status(400).json({ message: 'Ushbu login band' });
      user.username = username;
    }

    if (email) {
      const existing = await User.findOne({ where: { email, id: { [Op.ne]: user.id } } });
      if (existing) return res.status(400).json({ message: 'Ushbu email band' });
      user.email = email;
    }

    if (password) {
      if (password.length < 6) return res.status(400).json({ message: 'Parol kamida 6 belgili bo\'lsin' });
      user.password = await bcrypt.hash(password, 12);
    }

    await user.save();
    res.json({ message: 'Ma\'lumotlar yangilandi' });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
};


// 🔑 Admin tomonidan student parolini o'zgartirish
exports.updateUserPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  try {
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Yangi parol kamida 6 belgili bo\'lishi shart' });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    // Sessiyalarni tugatish (Yangi parol bilan qayta kirishga majburlash)
    await Session.destroy({ where: { userId: user.id } });

    res.json({ message: `Foydalanuvchi (${user.fullName}) paroli yangilandi` });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
};

// 📬 Parolni unutganda email orqali tiklash so'rovi
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const nodemailer = require('nodemailer');
  try {
    if (!email) return res.status(400).json({ message: 'Email manzilini kiriting' });

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Ushbu emailga ega foydalanuvchi topilmadi' });
    }

    // 🔑 One-time reset token yaratish
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 soat davomida faol

    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const emailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;

    if (emailConfigured) {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // TLS
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: `"IT Academy" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '🔒 Parolni tiklash so\'rovi',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #2563eb; text-align: center;">IT Academy</h2>
            <p>Assalomu alaykum, <b>${user.fullName || user.username}</b>!</p>
            <p>Siz tizimdagi parolingizni tiklash bo'yicha so'rov yubordingiz. Parolingizni yangilash uchun quyidagi tugmani bosing:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Parolni tiklash</a>
            </div>
            <p style="color: #64748b; font-size: 12px;">Ushbu havola faqat 1 soat davomida amal qiladi. Agar bu so'rovni siz yubormagan bo'lsangiz, xabarga e'tibor bermang.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      res.json({ message: 'Parolni tiklash havolasi emailingizga yuborildi!' });
    } else {
      console.log('\n=========================================');
      console.log('📬 [DEVELOPER MODE] EMAIL SOZLAMALARI TOPILMADI!');
      console.log(`Foydalanuvchi: ${user.username} (${user.email})`);
      console.log(`Parolni tiklash havolasi (Brauzerda oching):`);
      console.log(resetUrl);
      console.log('=========================================\n');

      // 💾 FAYLGA YOZISH (DEVELOPER DEBUG)
      const fs = require('fs');
      const path = require('path');
      fs.writeFileSync(path.join(__dirname, '../reset-link-debug.txt'), resetUrl);

      res.json({ 
        message: 'DEVELOPER MODE: Havola emailga yuborildi (va backend/reset-link-debug.txt fayliga saqlandi)!' 
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
};

// 🔒 Token orqali parolni yangilash
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Parol kamida 6 belgili bo\'lishi kerak' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Havola yaroqsiz yoki muddati tugagan' });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    await Session.destroy({ where: { userId: user.id } });

    res.json({ message: 'Parolingiz muvaffaqiyatli yangilandi! Endi yangi parol bilan kirishingiz mumkin.' });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
};

// 🔒 Qurilma sessiyasini o'chirish (Device Limit sahifasi uchun)
exports.deleteSession = async (req, res) => {
  const { username, phone, password, sessionId } = req.body;

  try {
    if (!sessionId) {
      return res.status(400).json({ message: 'Sessiya ID ko\'rsatilmadi' });
    }

    const user = await User.findOne({ 
      where: {
        [Op.or]: [
          username ? { username } : null,
          phone ? { phone } : null
        ].filter(Boolean)
      } 
    });

    if (!user) return res.status(401).json({ message: 'Ma\'lumotlar noto\'g\'ri' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Ma\'lumotlar noto\'g\'ri' });

    // Sessiyani o'chirish
    const session = await Session.findOne({ where: { id: sessionId, userId: user.id } });
    if (!session) {
      return res.status(404).json({ message: 'Sessiya topilmadi yoki sizga tegishli emas' });
    }

    await session.destroy();

    res.json({ message: 'Qurilma sessiyasi muvaffaqiyatli o\'chirildi. Endi qaytadan tizimga kirishingiz mumkin.' });
  } catch (error) {
    res.status(500).json({ message: 'Sessiyani o\'chirishda xatolik', error: error.message });
  }
};
