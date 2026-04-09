const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true, // Nullable initially for OTP flow
  },
  role: {
    type: DataTypes.ENUM('super_admin', 'admin', 'school', 'teacher', 'counsellor', 'staff'),
    allowNull: false,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  otp_expiry: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  third_party_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: ["all"], // Super Admin by default or full access for others
  },
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
  },
});

module.exports = User;
