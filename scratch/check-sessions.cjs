const sequelize = require('../backend/db');
const Session = require('../backend/models/Session');

const check = async () => {
  try {
    const sessions = await Session.findAll();
    console.log('=== SESSIONS IN DATABASE ===');
    sessions.forEach(s => {
      console.log(`UserID: ${s.userId} | DeviceFingerprint: ${s.deviceId} | DeviceInfo: ${s.deviceInfo}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
