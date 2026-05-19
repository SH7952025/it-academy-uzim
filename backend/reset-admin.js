/**
 * 🔒 IT Academy - Admin Parolini Tiklash va Yangilash Skripti
 * 
 * Ushbu skript yordamida serverda (SSH orqali) yoki lokal kompyuterda 
 * admin login va parolini tezkor tiklashingiz mumkin.
 * 
 * Foydalanish:
 * 1. Standart holatga qaytarish (login: admin, parol: admin123):
 *    node reset-admin.js
 * 
 * 2. Maxsus login va parol o'rnatish:
 *    node reset-admin.js <yangi_login> <yangi_parol>
 *    Misol: node reset-admin.js Shavkatbek mysecurepassword123
 */

const sequelize = require('./db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Argumentlarni olish
const args = process.argv.slice(2);
const newUsername = args[0] || 'admin';
const newPassword = args[1] || 'admin123';

const resetAdmin = async () => {
  try {
    // Bazaga ulanishni tekshirish
    await sequelize.authenticate();
    
    // Tizimda mavjud bo'lgan adminni izlash
    let admin = await User.findOne({ where: { role: 'admin' } });

    if (!admin) {
      // Agar tizimda umuman admin bo'lmasa, yangi admin yaratamiz
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      admin = await User.create({
        username: newUsername,
        password: hashedPassword,
        role: 'admin',
        fullName: 'Super Admin',
        email: 'admin@gmail.com'
      });
      console.log('\n=========================================');
      console.log('🚀 Tizimda admin topilmadi. Yangi admin yaratildi!');
    } else {
      // Agar admin mavjud bo'lsa, uning ma'lumotlarini yangilaymiz
      admin.username = newUsername;
      admin.password = await bcrypt.hash(newPassword, 12);
      admin.email = 'admin@gmail.com';
      await admin.save();
      console.log('\n=========================================');
      console.log('🚀 Admin ma\'lumotlari muvaffaqiyatli yangilandi!');
    }

    console.log(`👉 Yangi Login: ${newUsername}`);
    console.log(`👉 Yangi Parol: ${newPassword}`);
    console.log('=========================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Xatolik yuz berdi:', error.message);
    process.exit(1);
  }
};

resetAdmin();
