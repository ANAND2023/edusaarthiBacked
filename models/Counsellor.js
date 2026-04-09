const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Counsellor = sequelize.define('Counsellor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  profile_photo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  aadhar_card: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pan_card: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  qualification_proof: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  highest_qualification: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  institutions_added: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  educators_added: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

module.exports = Counsellor;
