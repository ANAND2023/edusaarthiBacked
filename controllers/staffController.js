const { User, Staff, Lead } = require('../models');
const { sendOTP } = require('../utils/email');

// Create Staff (Admin/SuperAdmin)
exports.createStaff = async (req, res) => {
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
      user.role = 'staff';
      user.is_verified = true;
      user.plain_password = password;
      await user.save();
    } else {
      // Create new user account (fallback if OTP wasn't used)
      user = await User.create({
        email,
        password,
        role: 'staff',
        is_verified: true,
        plain_password: password,
      });
    }

    const profileData = {
      user_id: user.id,
      full_name,
      mobile,
      highest_qualification,
      address,
    };

    if (req.files) {
      if (req.files.profile_photo) profileData.profile_photo = `/uploads/profile_pics/${req.files.profile_photo[0].filename}`;
      if (req.files.aadhar_card) profileData.aadhar_card = `/uploads/documents/${req.files.aadhar_card[0].filename}`;
      if (req.files.pan_card) profileData.pan_card = `/uploads/documents/${req.files.pan_card[0].filename}`;
      if (req.files.qualification_proof) profileData.qualification_proof = `/uploads/documents/${req.files.qualification_proof[0].filename}`;
    }

    const staff = await Staff.create(profileData);

    // Send welcome/verification email
    try {
      await sendOTP(email, `WELCOME - Your EduSaarthi staff account has been created. Login with: Email: ${email} | Password: ${password}`);
    } catch (mailErr) {
      console.warn('[createStaff] Email notification failed:', mailErr.message);
    }

    res.status(201).json({ message: 'Staff created successfully', staff });
  } catch (error) {
    console.error('[createStaff Error]', error);
    res.status(500).json({ message: 'Error creating staff', error: error.message });
  }
};

// Get all Staff
exports.getAllStaff = async (req, res) => {
  try {
    const staffList = await Staff.findAll({
      include: [{ model: User, attributes: ['id', 'email', 'createdAt', 'is_active'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(staffList);
  } catch (error) {
    console.error('[getAllStaff Error]', error);
    res.status(500).json({ message: 'Error fetching staff' });
  }
};

// Update Staff (Admin)
exports.updateStaff = async (req, res) => {
  const { id } = req.params;
  const { full_name, mobile, highest_qualification, address } = req.body;

  try {
    const staff = await Staff.findByPk(id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    if (full_name) staff.full_name = full_name;
    if (mobile) staff.mobile = mobile;
    if (highest_qualification) staff.highest_qualification = highest_qualification;
    if (address) staff.address = address;

    if (req.files) {
      if (req.files.profile_photo) staff.profile_photo = `/uploads/profile_pics/${req.files.profile_photo[0].filename}`;
      if (req.files.aadhar_card) staff.aadhar_card = `/uploads/documents/${req.files.aadhar_card[0].filename}`;
      if (req.files.pan_card) staff.pan_card = `/uploads/documents/${req.files.pan_card[0].filename}`;
      if (req.files.qualification_proof) staff.qualification_proof = `/uploads/documents/${req.files.qualification_proof[0].filename}`;
    }

    await staff.save();
    res.json({ message: 'Staff updated', staff });
  } catch (error) {
    console.error('[updateStaff Error]', error);
    res.status(500).json({ message: 'Error updating staff' });
  }
};

// Toggle Staff Active/Inactive (replaces delete)
exports.toggleStaffStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const staff = await Staff.findByPk(id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const user = await User.findByPk(staff.user_id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.is_active = !user.is_active;
    await user.save();

    res.json({ message: `Staff ${user.is_active ? 'activated' : 'deactivated'} successfully`, is_active: user.is_active });
  } catch (error) {
    console.error('[toggleStaffStatus Error]', error);
    res.status(500).json({ message: 'Error toggling staff status' });
  }
};

// Reset Staff Password
exports.resetPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    const staff = await Staff.findByPk(id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const user = await User.findByPk(staff.user_id);
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

// Get Staff Password (Admin view)
exports.getStaffPassword = async (req, res) => {
  const { id } = req.params;

  try {
    const staff = await Staff.findByPk(id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const user = await User.findByPk(staff.user_id, { attributes: ['plain_password'] });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ plain_password: user.plain_password || 'Password not available (set before this feature)' });
  } catch (error) {
    console.error('[getStaffPassword Error]', error);
    res.status(500).json({ message: 'Error fetching password' });
  }
};

// Staff: Get own profile
exports.getMyProfile = async (req, res) => {
  try {
    const staff = await Staff.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, attributes: ['email'] }],
    });
    if (!staff) return res.status(404).json({ message: 'Profile not found' });
    res.json(staff);
  } catch (error) {
    console.error('[getMyProfile Error]', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

// Staff: Get my leads
exports.getMyLeads = async (req, res) => {
  try {
    const staff = await Staff.findOne({ where: { user_id: req.user.id } });
    if (!staff) return res.status(404).json({ message: 'Staff profile not found' });

    const leads = await Lead.findAll({
      where: { staff_id: staff.id },
      include: [{ model: User, as: 'AssignedByUser', attributes: ['email'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(leads);
  } catch (error) {
    console.error('[getMyLeads Error]', error);
    res.status(500).json({ message: 'Error fetching leads' });
  }
};

// Staff: Update lead status
exports.updateLeadStatus = async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  try {
    const staff = await Staff.findOne({ where: { user_id: req.user.id } });
    if (!staff) return res.status(404).json({ message: 'Staff profile not found' });

    const lead = await Lead.findOne({ where: { id, staff_id: staff.id } });
    if (!lead) return res.status(404).json({ message: 'Lead not found or not assigned to you' });

    if (status) lead.status = status;
    if (notes) lead.notes = notes;

    await lead.save();
    res.json({ message: 'Lead updated', lead });
  } catch (error) {
    console.error('[updateLeadStatus Error]', error);
    res.status(500).json({ message: 'Error updating lead' });
  }
};
