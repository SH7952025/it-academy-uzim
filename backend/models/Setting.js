const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Setting = sequelize.define('Setting', {
  key: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = Setting;
