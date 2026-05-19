const User = require('../backend/models/User');
const Course = require('../backend/models/Course');
const bcrypt = require('bcryptjs');

async function setup() {
  try {
    // 1. Create a student if none exist
    const student = await User.findOne({ where: { role: 'student' } });
    if (!student) {
      const hashed = await bcrypt.hash('student123', 10);
      await User.create({ 
        fullName: 'Test Student', 
        phone: '901112233', 
        username: 'student', 
        password: hashed, 
        role: 'student' 
      });
      console.log('Created test student: student / student123');
    }

    // 2. Create a course if none exist
    const course = await Course.findOne();
    if (!course) {
      await Course.create({
        title: 'React Professional Kursi',
        description: 'Reactni noldan o\'rganing',
        price: '1,000,000 so\'m',
        category: 'Frontend'
      });
      console.log('Created test course');
    }
  } catch (err) {
    console.error(err);
  }
  process.exit();
}

setup();
