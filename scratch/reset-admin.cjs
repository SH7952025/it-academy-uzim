const sequelize = require('../backend/db');
const User = require('../backend/models/User');
const bcrypt = require('bcryptjs');

const reset = async () => {
  try {
    const admin = await User.findByPk(6);
    if (admin) {
      admin.username = 'admin';
      admin.password = await bcrypt.hash('admin123', 12);
      await admin.save();
      console.log('Admin user ID 6 reset to admin / admin123');
    } else {
      console.log('Admin user with ID 6 not found.');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

reset();
