const Mentor = require('./models/Mentor');
const sequelize = require('./db');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');

    const mentors = [
      { name: 'Xurshidbek', speciality: 'Frontend Developer', telegram: 'https://t.me/example', instagram: 'https://instagram.com/example' },
      { name: 'Sardorbek', speciality: 'Backend Developer', telegram: 'https://t.me/example', github: 'https://github.com/example' },
      { name: 'Mohir', speciality: 'UI/UX Designer', instagram: 'https://instagram.com/example', linkedin: 'https://linkedin.com/in/example' },
    ];

    for (const m of mentors) {
      await Mentor.create(m);
    }

    console.log('Mentors seeded!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
