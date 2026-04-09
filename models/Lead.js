const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Lead = sequelize.define('Lead', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  contact_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contact_phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contact_email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'not_completed'),
    defaultValue: 'pending',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = Lead;
