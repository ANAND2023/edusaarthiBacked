const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendOTP } = require('../utils/email');
const crypto = require('crypto');

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Register with OTP
exports.register = async (req, res) => {
  const { email, role } = req.body;

  try {
    let user = await User.findOne({ where: { email } });
    const otp = generateOTP();
    const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (user) {
      if (user.is_verified) {
        return res.status(400).json({ message: 'User already verified, please login.' });
      }
      // Update OTP for existing unverified user
      user.otp = otp;
      user.otp_expiry = otp_expiry;
      await user.save();
    } else {
      // Create new unverified user
      user = await User.create({
        email,
        role,
        otp,
        otp_expiry,
        is_verified: false,
      });
    }

    // Send OTP via email
    await sendOTP(email, otp);
    res.json({ message: 'OTP sent to email. Please verify.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error in registration' });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ where: { email, otp } });

    if (!user || user.otp_expiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.is_verified = true;
    user.otp = null;
    user.otp_expiry = null;
    await user.save();

    res.json({ message: 'Email verified successfully. Please set your password.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};

// Send OTP for Staff / Counsellor creation by Admin
exports.sendStaffCounsellorOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }
    
    // We can store this OTP temporarily in a cache or just find a dummy user. 
    // Since we need to verify before creation, let's create a pending user entry.
    const otp = generateOTP();
    const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    let dummyUser = await User.findOne({ where: { email, is_verified: false, role: 'pending_staff' } });
    if (dummyUser) {
      dummyUser.otp = otp;
      dummyUser.otp_expiry = otp_expiry;
      await dummyUser.save();
    } else {
      await User.create({
        email,
        role: 'pending_staff',
        otp,
        otp_expiry,
        is_verified: false,
      });
    }

    await sendOTP(email, otp);
    res.json({ message: 'OTP sent to email. Please verify.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
};

exports.verifyStaffCounsellorOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ where: { email, otp, role: 'pending_staff' } });
    if (!user || user.otp_expiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.is_verified = true;
    user.otp = null;
    user.otp_expiry = null;
    await user.save();

    res.json({ message: 'Email verified successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};

// Set Password
exports.setPassword = async (req, res) => {
  const { email, password, thirdPartyId } = req.body;

  try {
    const user = await User.findOne({ where: { email, is_verified: true } });

    if (!user) {
      return res.status(400).json({ message: 'User not found or not verified' });
    }

    // Password hashing handled by Sequelize hook
    user.password = password;
    if (thirdPartyId !== undefined) {
      user.third_party_id = thirdPartyId;
    }
    await user.save();

    // Auto-login after registration
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ 
      message: 'Password set successfully!',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error setting password' });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user || !user.is_verified || !user.password) {
      return res.status(400).json({ message: 'Invalid credentials or user not verified' });
    }

    // Check if user is active (counsellors/staff can be deactivated by admin)
    if (!user.is_active) {
      return res.status(403).json({ message: 'You are inactive. Please contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Admin login at /admin logic (already part of role)
    // We will issue a JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error in login' });
  }
};
// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  const { email, password, permissions } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      email,
      password,
      role: 'admin',
      is_verified: true,
      permissions: permissions || ['verify_school']
    });

    res.status(201).json({ message: 'Admin created successfully', user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating admin' });
  }
};

// Get all Admins (Super Admin only)
exports.getAdmins = async (req, res) => {
  try {
    const admins = await User.findAll({ 
      where: { role: 'admin' },
      attributes: ['id', 'email', 'role', 'permissions', 'createdAt']
    });
    res.json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching admins' });
  }
};

// Delete Admin (Super Admin only)
exports.deleteAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await User.findOne({ where: { id, role: 'admin' } });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    await admin.destroy();
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting admin' });
  }
};

// Update Admin Password (Super Admin only)
exports.updateAdminPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    const admin = await User.findOne({ where: { id, role: 'admin' } });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ message: 'Admin password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating admin password' });
  }
};
