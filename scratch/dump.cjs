const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });

const dbPath = path.resolve(__dirname, '../backend/db.js');
const courseModelPath = path.resolve(__dirname, '../backend/models/Course.js');
const mentorModelPath = path.resolve(__dirname, '../backend/models/Mentor.js');

const sequelize = require(dbPath);
const Course = require(courseModelPath);
const Mentor = require(mentorModelPath);

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
