const { School, Job, Application, Teacher, User } = require('../models');
const { Op } = require('sequelize');

// Get School Dashboard Stats
exports.getStats = async (req, res) => {
    const user_id = req.user.id;
    try {
        const school = await School.findOne({ where: { user_id } });
        if (!school) return res.status(404).json({ message: 'School not found' });

        const activeJobsCount = await Job.count({ where: { school_id: school.id, status: 'active' } });
        
        // Total applications for all jobs of this school
        const applicationsCount = await Application.count({
            include: [{
                model: Job,
                where: { school_id: school.id }
            }]
        });

        const successfulHiresCount = await Application.count({
            where: { status: 'shortlisted' },
            include: [{
                model: Job,
                where: { school_id: school.id }
            }]
        });

        const rejectedCount = await Application.count({
            where: { status: 'rejected' },
            include: [{
                model: Job,
                where: { school_id: school.id }
            }]
        });

        res.json({
            activeJobs: activeJobsCount.toString(),
            totalApplications: applicationsCount.toString(),
            successfulHires: successfulHiresCount.toString(),
            rejectedCount: rejectedCount.toString()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching school stats' });
    }
};

// Get School Profile
exports.getProfile = async (req, res) => {
  const user_id = req.user.id;
  try {
    const school = await School.findOne({ where: { user_id } });
    // If not found, return an empty object instead of 404 to avoid frontend errors on first login
    res.json({ school: school || null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching school profile' });
  }
};

// Create/Update School Profile
exports.updateProfile = async (req, res) => {
  const { name, location, logo, whatsapp_no, pincode, address, principal_contact, principal_name, owner_name, affiliation, document_urls } = req.body;
  const user_id = req.user.id;

  try {
    let school = await School.findOne({ where: { user_id } });

    if (school) {
      school.name = name || school.name;
      school.location = location || school.location;
      school.logo = logo || school.logo;
      if (whatsapp_no !== undefined) school.whatsapp_no = whatsapp_no;
      if (pincode !== undefined) school.pincode = pincode;
      if (address !== undefined) school.address = address;
      if (principal_contact !== undefined) school.principal_contact = principal_contact;
      if (principal_name !== undefined) school.principal_name = principal_name;
      if (owner_name !== undefined) school.owner_name = owner_name;
      if (affiliation !== undefined) school.affiliation = affiliation;
      if (document_urls !== undefined) school.document_urls = document_urls;
      await school.save();
    } else {
      // If creating for the first time, we need a name. 
      // If name is missing (e.g. from a first-time automatic call), we skip creation.
      if (!name) {
        return res.status(400).json({ message: 'Institution name is required to initialize profile.' });
      }
      school = await School.create({
        user_id,
        name,
        location,
        logo,
        whatsapp_no,
        pincode,
        address,
        principal_contact,
        principal_name,
        owner_name,
        affiliation,
        document_urls,
      });
    }

    res.json({ message: 'Profile updated successfully', school });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating school profile' });
  }
};

// Post a Job
exports.postJob = async (req, res) => {
  const { title, description, salary, location, requirements, job_type } = req.body;
  const user_id = req.user.id;

  try {
    const school = await School.findOne({ where: { user_id } });
    console.log(`[postJob] User ID: ${user_id}, School Found: ${!!school}, Verified: ${school?.is_verified_by_admin}`);
    
    if (!school) {
        return res.status(404).json({ message: 'School profile not found' });
    }

    // Check if school is verified by admin
    if (!school.is_verified_by_admin) {
        return res.status(403).json({ message: 'Wait for admin verification to post jobs' });
    }

    const isFresher = job_type === 'Fresher';
    if (!isFresher && !school.has_package) {
        return res.status(403).json({ message: 'Please purchase a package to post requirements.' });
    }

    // Convert requirements from string to array if it is a string
    const reqArray = typeof requirements === 'string' 
      ? requirements.split('\n').map(r => r.trim()).filter(r => r !== "")
      : (Array.isArray(requirements) ? requirements : []);

    const job = await Job.create({
      school_id: school.id,
      title,
      description,
      salary,
      location,
      requirements: reqArray,
      job_type,
      is_free: isFresher
    });

    res.json({ message: 'Job posted successfully', job });
  } catch (error) {
    console.error('[postJob Error]', error);
    res.status(500).json({ message: 'Error posting job' });
  }
};

// View applications for a specific job
exports.getJobApplications = async (req, res) => {
    const { jobId } = req.params;

    try {
        const applications = await Application.findAll({
            where: { job_id: jobId },
            include: [{
                model: Teacher,
                include: [{ model: User, attributes: ['email'] }]
            }]
        });
        res.json(applications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching applications' });
    }
};

// Shortlist/Reject application
exports.updateApplicationStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'shortlisted' or 'rejected'

    try {
        const application = await Application.findByPk(id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        application.status = status;
        await application.save();

        res.json({ message: `Application ${status} successfully`, application });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating application status' });
    }
};

// Get My Jobs (posted by this school)
exports.getMyJobs = async (req, res) => {
    const user_id = req.user.id;
    try {
        const school = await School.findOne({ where: { user_id } });
        if (!school) return res.status(404).json({ message: 'School not found' });

        const jobs = await Job.findAll({
            where: { school_id: school.id },
            include: [{ model: Application, attributes: ['id'] }]
        });
        res.json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching jobs' });
    }
};

// Get All Applications for this School
exports.getAllApplications = async (req, res) => {
    const user_id = req.user.id;
    try {
        const school = await School.findOne({ where: { user_id } });
        if (!school) return res.status(404).json({ message: 'School not found' });

        const applications = await Application.findAll({
            include: [
                {
                    model: Job,
                    where: { school_id: school.id },
                    attributes: ['title']
                },
                {
                    model: Teacher,
                    attributes: ['full_name', 'skills', 'experience', 'id']
                }
            ]
        });
        res.json(applications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching applications' });
    }
};
// Upgrade Package (Simulated payment)
exports.upgradePackage = async (req, res) => {
    const user_id = req.user.id;
    const { planId } = req.body;

    try {
        const school = await School.findOne({ where: { user_id } });
        if (!school) return res.status(404).json({ message: 'Institution not found' });

        school.has_package = true;
        // In a real app we would store the actual plan details
        await school.save();

        res.json({ message: `Successfully upgraded to ${planId} plan!`, school });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error upgrading package' });
    }
};
