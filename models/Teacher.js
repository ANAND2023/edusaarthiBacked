const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Teacher = sequelize.define('Teacher', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profile_pic: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resume_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  skills: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  linkedin_profile: { type: DataTypes.STRING, allowNull: true },
  whatsapp_no: { type: DataTypes.STRING, allowNull: true },
  is_verified_by_admin: { type: DataTypes.BOOLEAN, defaultValue: false },
  previous_history: { type: DataTypes.TEXT, allowNull: true },
});

module.exports = Teacher;
