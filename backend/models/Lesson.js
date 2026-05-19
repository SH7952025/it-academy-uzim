const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Lesson = sequelize.define('Lesson', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  videoType: {
    type: DataTypes.ENUM('url', 'file'),
    defaultValue: 'url',
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
});

module.exports = Lesson;
