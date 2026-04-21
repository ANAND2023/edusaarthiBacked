const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const School = sequelize.define('School', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_verified_by_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  whatsapp_no: { type: DataTypes.STRING, allowNull: true },
  pincode: { type: DataTypes.STRING, allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  principal_contact: { type: DataTypes.STRING, allowNull: true },
  principal_name: { type: DataTypes.STRING, allowNull: true },
  owner_name: { type: DataTypes.STRING, allowNull: true },
  affiliation: { type: DataTypes.STRING, allowNull: true },
  document_urls: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  has_package: { type: DataTypes.BOOLEAN, defaultValue: false },
  follow_up_notes: { type: DataTypes.TEXT, allowNull: true },
  subscription_status: {
    type: DataTypes.ENUM('none', 'pending', 'active'),
    defaultValue: 'none',
  },
  subscription_plan: { type: DataTypes.STRING, allowNull: true },
});

module.exports = School;
