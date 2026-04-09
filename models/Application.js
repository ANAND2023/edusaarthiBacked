const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  status: {
    type: DataTypes.ENUM('pending', 'shortlisted', 'rejected'),
    defaultValue: 'pending',
  },
}, {
  timestamps: true,
});

module.exports = Application;
