const { User, Counsellor, Referral } = require('../models');
const bcrypt = require('bcryptjs');
const { sendOTP } = require('../utils/email');

// Create Counsellor (Admin/SuperAdmin)
exports.createCounsellor = async (req, res) => {
  const { email, password, full_name, mobile, highest_qualification, address } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    let user;

    if (existingUser) {
      if (existingUser.role !== 'pending_staff') {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      // Update existing pending_staff user
      user = existingUser;
      user.password = password;
      user.role = 'counsellor';
      user.is_verified = true;
      user.plain_password = password;
      await user.save();
    } else {
      // Create new user account (fallback if OTP wasn't used)
      user = await User.create({
        email,
        password,
        role: 'counsellor',
        is_verified: true,
        plain_password: password,
      });
    }

    // Build profile data from body + uploaded files
    const profileData = {
      user_id: user.id,
      full_name,
      mobile,
      highest_qualification,
      address,
    };

    // Handle file uploads
    if (req.files) {
      if (req.files.profile_photo) profileData.profile_photo = `/uploads/profile_pics/${req.files.profile_photo[0].filename}`;
      if (req.files.aadhar_card) profileData.aadhar_card = `/uploads/documents/${req.files.aadhar_card[0].filename}`;
      if (req.files.pan_card) profileData.pan_card = `/uploads/documents/${req.files.pan_card[0].filename}`;
      if (req.files.qualification_proof) profileData.qualification_proof = `/uploads/documents/${req.files.qualification_proof[0].filename}`;
    }

    const counsellor = await Counsellor.create(profileData);

    // Send a welcome/verification notification email
    try {
      await sendOTP(email, `WELCOME - Your EduSaarthi counsellor account has been created. Login with: Email: ${email} | Password: ${password}`);
    } catch (mailErr) {
      console.warn('[createCounsellor] Email notification failed:', mailErr.message);
    }

    res.status(201).json({ message: 'Counsellor created successfully', counsellor });
  } catch (error) {
    console.error('[createCounsellor Error]', error);
    res.status(500).json({ message: 'Error creating counsellor', error: error.message });
  }
};

// Get all Counsellors
exports.getAllCounsellors = async (req, res) => {
  try {
    const counsellors = await Counsellor.findAll({
      include: [{ model: User, attributes: ['id', 'email', 'createdAt', 'is_active'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(counsellors);
  } catch (error) {
    console.error('[getAllCounsellors Error]', error);
    res.status(500).json({ message: 'Error fetching counsellors' });
  }
};

// Update Counsellor (Admin)
exports.updateCounsellor = async (req, res) => {
  const { id } = req.params;
  const { full_name, mobile, highest_qualification, address } = req.body;

  try {
    const counsellor = await Counsellor.findByPk(id);
    if (!counsellor) return res.status(404).json({ message: 'Counsellor not found' });

    if (full_name) counsellor.full_name = full_name;
    if (mobile) counsellor.mobile = mobile;
    if (highest_qualification) counsellor.highest_qualification = highest_qualification;
    if (address) counsellor.address = address;

    if (req.files) {
      if (req.files.profile_photo) counsellor.profile_photo = `/uploads/profile_pics/${req.files.profile_photo[0].filename}`;
      if (req.files.aadhar_card) counsellor.aadhar_card = `/uploads/documents/${req.files.aadhar_card[0].filename}`;
      if (req.files.pan_card) counsellor.pan_card = `/uploads/documents/${req.files.pan_card[0].filename}`;
      if (req.files.qualification_proof) counsellor.qualification_proof = `/uploads/documents/${req.files.qualification_proof[0].filename}`;
    }

    await counsellor.save();
    res.json({ message: 'Counsellor updated', counsellor });
  } catch (error) {
    console.error('[updateCounsellor Error]', error);
    res.status(500).json({ message: 'Error updating counsellor' });
  }
};

// Toggle Counsellor Active/Inactive (replaces delete)
exports.toggleCounsellorStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const counsellor = await Counsellor.findByPk(id);
    if (!counsellor) return res.status(404).json({ message: 'Counsellor not found' });

    const user = await User.findByPk(counsellor.user_id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.is_active = !user.is_active;
    await user.save();

    res.json({ message: `Counsellor ${user.is_active ? 'activated' : 'deactivated'} successfully`, is_active: user.is_active });
  } catch (error) {
    console.error('[toggleCounsellorStatus Error]', error);
    res.status(500).json({ message: 'Error toggling counsellor status' });
  }
};

// Reset Counsellor Password
exports.resetPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    const counsellor = await Counsellor.findByPk(id);
    if (!counsellor) return res.status(404).json({ message: 'Counsellor not found' });

    const user = await User.findByPk(counsellor.user_id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = newPassword;
    user.plain_password = newPassword; // Store plain text for admin viewing
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('[resetPassword Error]', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

// Get Counsellor Password (Admin view)
exports.getCounsellorPassword = async (req, res) => {
  const { id } = req.params;

  try {
    const counsellor = await Counsellor.findByPk(id);
    if (!counsellor) return res.status(404).json({ message: 'Counsellor not found' });

    const user = await User.findByPk(counsellor.user_id, { attributes: ['plain_password'] });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ plain_password: user.plain_password || 'Password not available (set before this feature)' });
  } catch (error) {
    console.error('[getCounsellorPassword Error]', error);
    res.status(500).json({ message: 'Error fetching password' });
  }
};

// Counsellor: Get own profile
exports.getMyProfile = async (req, res) => {
  try {
    const counsellor = await Counsellor.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, attributes: ['email'] }],
    });
    if (!counsellor) return res.status(404).json({ message: 'Profile not found' });
    res.json(counsellor);
  } catch (error) {
    console.error('[getMyProfile Error]', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

// Counsellor: Update own profile (limited fields)
exports.updateMyProfile = async (req, res) => {
  const { mobile, address } = req.body;

  try {
    const counsellor = await Counsellor.findOne({ where: { user_id: req.user.id } });
    if (!counsellor) return res.status(404).json({ message: 'Profile not found' });

    if (mobile) counsellor.mobile = mobile;
    if (address) counsellor.address = address;

    await counsellor.save();
    res.json({ message: 'Profile updated', counsellor });
  } catch (error) {
    console.error('[updateMyProfile Error]', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// Counsellor: Add referral count & record
exports.addReferral = async (req, res) => {
  const { type, details } = req.body; // 'institution' or 'educator'

  try {
    const counsellor = await Counsellor.findOne({ where: { user_id: req.user.id } });
    if (!counsellor) return res.status(404).json({ message: 'Profile not found' });

    if (type === 'institution') {
      counsellor.institutions_added += 1;
    } else if (type === 'educator') {
      counsellor.educators_added += 1;
    } else {
      return res.status(400).json({ message: 'Invalid type. Use "institution" or "educator"' });
    }

    // Create Referral record
    await Referral.create({
      counsellor_id: counsellor.id,
      type: type,
      name: details?.name || 'Unknown',
      email: details?.email || null,
      mobile: details?.mobile || null,
      address: details?.address || null,
    });

    await counsellor.save();
    res.json({ message: `${type} referral added`, counsellor });
  } catch (error) {
    console.error('[addReferral Error]', error);
    res.status(500).json({ message: 'Error adding referral' });
  }
};

// Counsellor: Get all own referrals
exports.getMyReferrals = async (req, res) => {
  try {
    const counsellor = await Counsellor.findOne({ where: { user_id: req.user.id } });
    if (!counsellor) return res.status(404).json({ message: 'Profile not found' });

    const referrals = await Referral.findAll({
      where: { counsellor_id: counsellor.id },
      order: [['createdAt', 'DESC']]
    });

    res.json(referrals);
  } catch (error) {
    console.error('[getMyReferrals Error]', error);
    res.status(500).json({ message: 'Error fetching referrals' });
  }
};

// Admin: Get all referrals for a specific counsellor
exports.getCounsellorReferrals = async (req, res) => {
  const { id } = req.params;
  try {
    const referrals = await Referral.findAll({
      where: { counsellor_id: id },
      order: [['createdAt', 'DESC']]
    });
    res.json(referrals);
  } catch (error) {
    console.error('[getCounsellorReferrals Error]', error);
    res.status(500).json({ message: 'Error fetching referrals' });
  }
};
