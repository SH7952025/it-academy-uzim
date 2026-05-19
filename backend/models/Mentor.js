const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Mentor = sequelize.define('Mentor', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  speciality: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  telegram: { type: DataTypes.STRING, allowNull: true },
  instagram: { type: DataTypes.STRING, allowNull: true },
  facebook: { type: DataTypes.STRING, allowNull: true },
  linkedin: { type: DataTypes.STRING, allowNull: true },
  github: { type: DataTypes.STRING, allowNull: true },
});

module.exports = Mentor;
