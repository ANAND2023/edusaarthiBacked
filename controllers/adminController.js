const { School, User, Teacher, Application, Counsellor, Staff, Lead } = require('../models');

// Get dashboard stats
exports.getStats = async (req, res) => {
  try {
    const totalTeachers = await Teacher.count();
    const unverifiedSchools = await School.count({ where: { is_verified_by_admin: false } });
    const totalSchools = await School.count();
    const shortlistedApps = await Application.count({ where: { status: 'shortlisted' } });
    const totalCounsellors = await Counsellor.count();
    const totalStaff = await Staff.count();
    const totalLeads = await Lead.count();

    res.json({
      totalTeachers: totalTeachers.toString(),
      unverifiedSchools: unverifiedSchools.toString(),
      totalSchools: totalSchools.toString(),
      placements: shortlistedApps.toString(),
      totalCounsellors: totalCounsellors.toString(),
      totalStaff: totalStaff.toString(),
      totalLeads: totalLeads.toString(),
      revenue: "0"
    });
  } catch (error) {
    console.error("[getStats Error]", error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

// Get all unverified schools (for dashboard verification panel)
exports.getUnverifiedSchools = async (req, res) => {
  try {
    const schools = await School.findAll({
      where: { is_verified_by_admin: false },
      include: [{ model: User, attributes: ['email'] }],
    });
    res.json(schools);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching unverified schools' });
  }
};

// Get ALL schools (for Schools management page)
exports.getAllSchools = async (req, res) => {
  try {
    const schools = await School.findAll({
      include: [{ model: User, attributes: ['email'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(schools);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching all schools' });
  }
};

// Get ALL teachers (for Teachers management page)
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll({
      include: [{ model: User, attributes: ['email'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(teachers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching all teachers' });
  }
};

// Verify/Reject school
exports.verifySchool = async (req, res) => {
  const { id } = req.params;
  const { is_verified, follow_up_notes } = req.body;

  try {
    const school = await School.findByPk(id);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    if (is_verified !== undefined) school.is_verified_by_admin = is_verified;
    if (follow_up_notes !== undefined) school.follow_up_notes = follow_up_notes;
    
    await school.save();

    res.json({ message: `School updated successfully`, school });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating school' });
  }
};

// Verify School Payment (Admin) - Activates subscription
exports.verifySchoolPayment = async (req, res) => {
  const { id } = req.params;

  try {
    const school = await School.findByPk(id);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    if (school.subscription_status !== 'pending') {
      return res.status(400).json({ message: 'No pending payment request for this school.' });
    }

    school.subscription_status = 'active';
    school.has_package = true;
    await school.save();

    res.json({ message: 'Payment verified! Subscription activated.', school });
  } catch (error) {
    console.error('[verifySchoolPayment Error]', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
};
