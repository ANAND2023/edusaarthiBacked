const { Teacher, User, Job, Application, School } = require('../models');
const { Op } = require('sequelize');

// Update Teacher Profile
exports.updateProfile = async (req, res) => {
    const { full_name, profile_pic, resume_url, skills, experience, bio, linkedin_profile, whatsapp_no, previous_history, pincode, location } = req.body;
    const user_id = req.user.id;

    try {
        let teacher = await Teacher.findOne({ where: { user_id } });

        if (teacher) {
            teacher.full_name = full_name || teacher.full_name;
            teacher.profile_pic = profile_pic || teacher.profile_pic;
            if (resume_url !== undefined) teacher.resume_url = resume_url;
            teacher.skills = skills || teacher.skills;
            teacher.experience = experience || teacher.experience;
            teacher.bio = bio || teacher.bio;
            if (linkedin_profile !== undefined) teacher.linkedin_profile = linkedin_profile;
            if (whatsapp_no !== undefined) teacher.whatsapp_no = whatsapp_no;
            if (previous_history !== undefined) teacher.previous_history = previous_history;
            if (pincode !== undefined) teacher.pincode = pincode;
            if (location !== undefined) teacher.location = location;
            await teacher.save();
        } else {
            teacher = await Teacher.create({
                user_id,
                full_name,
                profile_pic,
                resume_url,
                skills,
                experience,
                bio,
                linkedin_profile,
                whatsapp_no,
                previous_history,
                pincode,
                location
            });
        }

        res.json({ message: 'Profile updated successfully', teacher });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating teacher profile' });
    }
};

// Browse Jobs (Only jobs from schools verified by admin)
exports.getJobs = async (req, res) => {
    const { pincode } = req.query;
    try {
        const schoolWhere = { is_verified_by_admin: true };
        if (pincode) {
            schoolWhere.pincode = pincode;
        }

        const jobs = await Job.findAll({
            where: { status: 'active' },
            include: [{
                model: School,
                where: schoolWhere,
                attributes: ['name', 'logo', 'location', 'pincode']
            }]
        });

        // If user is logged in, check which jobs they applied to
        let appliedJobIds = new Set();
        if (req.user) {
            const teacher = await Teacher.findOne({ where: { user_id: req.user.id } });
            if (teacher) {
                const teacherApps = await Application.findAll({
                    where: { teacher_id: teacher.id },
                    attributes: ['job_id']
                });
                appliedJobIds = new Set(teacherApps.map(a => a.job_id));
            }
        }

        const jobsWithStatus = jobs.map(job => ({
            ...job.toJSON(),
            hasApplied: appliedJobIds.has(job.id)
        }));

        res.json(jobsWithStatus);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching jobs' });
    }
};

// Apply for a Job
exports.applyForJob = async (req, res) => {
    const { jobId } = req.body;
    const user_id = req.user.id;

    try {
        const teacher = await Teacher.findOne({ where: { user_id } });
        if (!teacher) {
            return res.status(404).json({ message: 'Please create a profile first' });
        }

        // Check if already applied
        const existingApp = await Application.findOne({
            where: { job_id: jobId, teacher_id: teacher.id }
        });

        if (existingApp) {
            return res.status(400).json({ message: 'Already applied for this job' });
        }

        const application = await Application.create({
            job_id: jobId,
            teacher_id: teacher.id
        });

        res.json({ message: 'Applied successfully', application });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error applying for job' });
    }
};

// Get My Applications
exports.getMyApplications = async (req, res) => {
    const user_id = req.user.id;

    try {
        const teacher = await Teacher.findOne({ where: { user_id } });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher profile not found' });
        }

        const applications = await Application.findAll({
            where: { teacher_id: teacher.id },
            include: [{
                model: Job,
                include: [{ model: School, attributes: ['name', 'logo'] }]
            }]
        });
        res.json(applications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching applications' });
    }
};

// Get Dashboard Data
exports.getDashboardData = async (req, res) => {
    const user_id = req.user.id;

    try {
        const teacher = await Teacher.findOne({ where: { user_id } });
        let apps = [];
        let nearInstitutions = [];

        if (teacher) {
            apps = await Application.findAll({
                where: { teacher_id: teacher.id }
            });
            
            const schoolWhere = { is_verified_by_admin: true };
            if (teacher.pincode) {
                // Try to find schools in same pincode first
                nearInstitutions = await School.findAll({
                    where: { ...schoolWhere, pincode: teacher.pincode },
                    limit: 3,
                    order: [['createdAt', 'DESC']]
                });
            }

            // If none found in same pincode, or less than 3, fill with others
            if (nearInstitutions.length < 3) {
                const existingIds = nearInstitutions.map(s => s.id);
                const moreSchools = await School.findAll({
                    where: { 
                        ...schoolWhere,
                        id: { [Op.notIn]: existingIds },
                        has_package: true
                    },
                    limit: 3 - nearInstitutions.length,
                    order: [['createdAt', 'DESC']]
                });
                nearInstitutions = [...nearInstitutions, ...moreSchools];
            }
        }

        res.json({
            applications: apps,
            nearInstitutions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching dashboard data' });
    }
};
// Get Institution Profile (for Teachers)
exports.getInstitution = async (req, res) => {
    const { id } = req.params;
    try {
        const school = await School.findByPk(id, {
            attributes: [
                'id', 'name', 'logo', 'location', 'address', 'affiliation', 
                'is_verified_by_admin', 'whatsapp_no', 'principal_name'
            ]
        });
        if (!school) {
            return res.status(404).json({ message: 'Institution not found' });
        }
        res.json(school);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching institution profile' });
    }
};
