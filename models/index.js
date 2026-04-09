const { sequelize } = require('../config/db');
const User = require('./User');
const School = require('./School');
const Teacher = require('./Teacher');
const Job = require('./Job');
const Application = require('./Application');
const Counsellor = require('./Counsellor');
const Staff = require('./Staff');
const Lead = require('./Lead');
const Referral = require('./Referral');

// Define Associations
// User <-> School
User.hasOne(School, { foreignKey: { name: 'user_id', allowNull: false } });
School.belongsTo(User, { foreignKey: { name: 'user_id', allowNull: false } });

// User <-> Teacher
User.hasOne(Teacher, { foreignKey: { name: 'user_id', allowNull: false } });
Teacher.belongsTo(User, { foreignKey: { name: 'user_id', allowNull: false } });

// User <-> Counsellor
User.hasOne(Counsellor, { foreignKey: { name: 'user_id', allowNull: false } });
Counsellor.belongsTo(User, { foreignKey: { name: 'user_id', allowNull: false } });

// Counsellor <-> Referral
Counsellor.hasMany(Referral, { foreignKey: { name: 'counsellor_id', allowNull: false }, onDelete: 'CASCADE' });
Referral.belongsTo(Counsellor, { foreignKey: { name: 'counsellor_id', allowNull: false } });

// User <-> Staff
User.hasOne(Staff, { foreignKey: { name: 'user_id', allowNull: false } });
Staff.belongsTo(User, { foreignKey: { name: 'user_id', allowNull: false } });

// Staff <-> Lead
Staff.hasMany(Lead, { foreignKey: { name: 'staff_id', allowNull: false }, onDelete: 'CASCADE' });
Lead.belongsTo(Staff, { foreignKey: { name: 'staff_id', allowNull: false } });

// User (Admin) <-> Lead (assigned_by)
User.hasMany(Lead, { foreignKey: { name: 'assigned_by', allowNull: false }, as: 'AssignedLeads' });
Lead.belongsTo(User, { foreignKey: { name: 'assigned_by', allowNull: false }, as: 'AssignedByUser' });

// School <-> Job
School.hasMany(Job, { foreignKey: { name: 'school_id', allowNull: false }, onDelete: 'CASCADE' });
Job.belongsTo(School, { foreignKey: { name: 'school_id', allowNull: false } });

// Job <-> Application
Job.hasMany(Application, { foreignKey: { name: 'job_id', allowNull: false }, onDelete: 'CASCADE' });
Application.belongsTo(Job, { foreignKey: { name: 'job_id', allowNull: false } });

// Teacher <-> Application
Teacher.hasMany(Application, { foreignKey: { name: 'teacher_id', allowNull: false }, onDelete: 'CASCADE' });
Application.belongsTo(Teacher, { foreignKey: { name: 'teacher_id', allowNull: false } });

module.exports = {
  User,
  School,
  Teacher,
  Job,
  Application,
  Counsellor,
  Staff,
  Lead,
  Referral,
  sequelize
};
