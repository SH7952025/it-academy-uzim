const sequelize = require('../backend/db');
const Session = require('../backend/models/Session');
const User = require('../backend/models/User');

const clear = async () => {
  try {
    const admin = await User.findOne({ where: { role: 'admin' } });
    if (admin) {
      await Session.destroy({ where: { userId: admin.id } });
      console.log(`Successfully cleared all active sessions for admin user ID: ${admin.id}`);
    } else {
      console.log('Admin user not found.');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

clear();
