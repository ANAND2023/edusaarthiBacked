const { Lead, Staff, User } = require('../models');

// Create Lead (Admin/SuperAdmin)
exports.createLead = async (req, res) => {
  const { staff_id, title, description, contact_name, contact_phone, contact_email } = req.body;

  try {
    const staff = await Staff.findByPk(staff_id);
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });

    const lead = await Lead.create({
      staff_id,
      assigned_by: req.user.id,
      title,
      description,
      contact_name,
      contact_phone,
      contact_email,
      status: 'pending',
    });

    res.status(201).json({ message: 'Lead created and assigned', lead });
  } catch (error) {
    console.error('[createLead Error]', error);
    res.status(500).json({ message: 'Error creating lead', error: error.message });
  }
};

// Get all Leads (Admin)
exports.getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.findAll({
      include: [
        { model: Staff, attributes: ['id', 'full_name', 'mobile'] },
        { model: User, as: 'AssignedByUser', attributes: ['email'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(leads);
  } catch (error) {
    console.error('[getAllLeads Error]', error);
    res.status(500).json({ message: 'Error fetching leads' });
  }
};

// Update Lead (Admin)
exports.updateLead = async (req, res) => {
  const { id } = req.params;
  const { title, description, contact_name, contact_phone, contact_email, staff_id, status } = req.body;

  try {
    const lead = await Lead.findByPk(id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    if (title) lead.title = title;
    if (description) lead.description = description;
    if (contact_name) lead.contact_name = contact_name;
    if (contact_phone) lead.contact_phone = contact_phone;
    if (contact_email) lead.contact_email = contact_email;
    if (staff_id) lead.staff_id = staff_id;
    if (status) lead.status = status;

    await lead.save();
    res.json({ message: 'Lead updated', lead });
  } catch (error) {
    console.error('[updateLead Error]', error);
    res.status(500).json({ message: 'Error updating lead' });
  }
};

// Delete Lead (Admin)
exports.deleteLead = async (req, res) => {
  const { id } = req.params;

  try {
    const lead = await Lead.findByPk(id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    await lead.destroy();
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('[deleteLead Error]', error);
    res.status(500).json({ message: 'Error deleting lead' });
  }
};
