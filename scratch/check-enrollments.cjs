const sequelize = require('../backend/db');
const Enrollment = require('../backend/models/Enrollment');
const Course = require('../backend/models/Course');
const User = require('../backend/models/User');

// Define associations locally just like in backend/index.js
User.hasMany(Enrollment, { foreignKey: 'userId' });
Enrollment.belongsTo(User, { foreignKey: 'userId' });

Course.hasMany(Enrollment, { foreignKey: 'courseId' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId' });

const check = async () => {
  try {
    const enrollments = await Enrollment.findAll({
      include: [
        { model: Course, attributes: ['title'] },
        { model: User, attributes: ['fullName'] }
      ]
    });
    console.log('=== ENROLLMENTS IN DATABASE ===');
    enrollments.forEach(e => {
      console.log(`ID: ${e.id} | User: ${e.User?.fullName || 'N/A'} (ID: ${e.userId}) | Course: ${e.Course?.title || 'N/A'} (ID: ${e.courseId}) | Status: ${e.status}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error listing enrollments:', err);
    process.exit(1);
  }
};

check();
