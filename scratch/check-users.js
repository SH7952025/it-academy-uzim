const sequelize = require('../backend/db');
const User = require('../backend/models/User');

const check = async () => {
  try {
    const users = await User.findAll();
    console.log('=== USERS IN DATABASE ===');
    users.forEach(u => {
      console.log(`ID: ${u.id} | Username: ${u.username} | Role: ${u.role} | FullName: ${u.fullName}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
