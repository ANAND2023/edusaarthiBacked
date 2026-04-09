const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { connectDB, sequelize } = require('./config/db');
require('./models'); // Register all models and associations early

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/school', require('./routes/school'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/counsellor', require('./routes/counsellor'));
app.use('/api/staff', require('./routes/staff'));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect DB
    await connectDB();
    
    // Sync Database
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully');

    // Seed Admin User if not exists
    const { User } = require('./models');
    
    // Default Super Admin Seeding
    let superAdmin = await User.findOne({ where: { email: 'superadmin@gmail.com' } });
    
    if (!superAdmin) {
      // Check if there is an old admin account with super_admin role and update it
      const oldSuperAdmin = await User.findOne({ where: { role: 'super_admin' } });
      if (oldSuperAdmin) {
        oldSuperAdmin.email = 'superadmin@gmail.com';
        oldSuperAdmin.password = 'superadmin123';
        await oldSuperAdmin.save();
        console.log('Existing Super Admin updated to: superadmin@gmail.com');
      } else {
        await User.create({
          email: 'superadmin@gmail.com',
          password: 'superadmin123',
          role: 'super_admin',
          is_verified: true,
        });
        console.log('New Super Admin user seeded: superadmin@gmail.com');
      }
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server failed to start:', error);
  }
};

startServer();
