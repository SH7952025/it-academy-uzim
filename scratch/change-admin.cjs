const sequelize = require('../backend/db');
const User = require('../backend/models/User');
const Session = require('../backend/models/Session');
const bcrypt = require('bcryptjs');

const resetAdmin = async () => {
  try {
    // 1. Find the admin user
    const admin = await User.findOne({ where: { role: 'admin' } });
    if (!admin) {
      console.log('No admin user found. Creating a new admin user...');
      const hashedPassword = await bcrypt.hash('Admin123!', 12);
      const newAdmin = await User.create({
        fullName: 'Super Admin',
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        phone: '998901234567',
        email: 'admin@itacademy.uz'
      });
      console.log('New admin user created successfully!');
      console.log(`Username: ${newAdmin.username}`);
      console.log(`Password: Admin123!`);
    } else {
      console.log(`Found existing admin user: ${admin.username} (ID: ${admin.id})`);
      
      // 2. Change password and username
      const hashedPassword = await bcrypt.hash('Admin123!', 12);
      admin.username = 'admin';
      admin.password = hashedPassword;
      await admin.save();
      
      // 3. Clear active sessions
      await Session.destroy({ where: { userId: admin.id } });
      
      console.log('Admin user updated successfully!');
      console.log(`Username: ${admin.username}`);
      console.log(`Password: Admin123!`);
    }
    process.exit(0);
  } catch (error) {
    console.error('Error resetting admin:', error);
    process.exit(1);
  }
};

resetAdmin();
