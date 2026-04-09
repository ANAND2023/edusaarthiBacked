const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Referral = sequelize.define('Referral', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  counsellor_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('institution', 'educator'),
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  }
}, {
  tableName: 'referrals',
  timestamps: true,
});

module.exports = Referral;
