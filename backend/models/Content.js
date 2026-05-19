const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Gallery = sequelize.define('Gallery', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  image: { type: DataTypes.STRING, allowNull: false },
  caption: { type: DataTypes.STRING, allowNull: true }
});

const News = sequelize.define('News', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: true },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = { Gallery, News };
