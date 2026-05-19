const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  deviceInfo: {
    type: DataTypes.STRING, // Browser/OS haqida ma'lumot
    allowNull: true,
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  lastActive: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
});

module.exports = Session;
