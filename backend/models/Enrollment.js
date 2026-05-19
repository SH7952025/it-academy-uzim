const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'completed'),
    defaultValue: 'active',
  },
  completedLessons: {
    type: DataTypes.JSON,
    defaultValue: [],
  }
});

module.exports = Enrollment;
