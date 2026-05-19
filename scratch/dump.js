import sequelize from '../backend/db.js';
import Course from '../backend/models/Course.js';
import Mentor from '../backend/models/Mentor.js';

async function dump() {
    try {
        const courses = await Course.findAll();
        const mentors = await Mentor.findAll();
        console.log('--- COURSES ---');
        console.log(JSON.stringify(courses.map(c => c.toJSON()), null, 2));
        console.log('--- MENTORS ---');
        console.log(JSON.stringify(mentors.map(m => m.toJSON()), null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
dump();
