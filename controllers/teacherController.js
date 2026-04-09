const { Teacher, User, Job, Application, School } = require('../models');
const { Op } = require('sequelize');

// Update Teacher Profile
exports.updateProfile = async (req, res) => {
    const { full_name, profile_pic, resume_url, skills, experience, bio, linkedin_profile, whatsapp_no, previous_history } = req.body;
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
    const user_id = req.user.id;
    try {
        const teacher = await Teacher.findOne({ where: { user_id } });
        
        const jobs = await Job.findAll({
            where: { status: 'active' },
            include: [{
                model: School,
                where: { is_verified_by_admin: true },
                attributes: ['name', 'logo', 'location']
            }]
        });

        if (!teacher) {
            return res.json(jobs.map(j => ({ ...j.toJSON(), hasApplied: false })));
        }

        const teacherApps = await Application.findAll({
            where: { teacher_id: teacher.id },
            attributes: ['job_id']
        });
        const appliedJobIds = new Set(teacherApps.map(a => a.job_id));

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
            
            // Assuming we match pincode if teacher has it (wait, teacher doesn't have pincode in Teacher model right now..)
            // We'll just fetch ANY 3 paid verified schools for now if pincode logic isn't strictly matchable.
            // Ideally we'd match location.
            nearInstitutions = await School.findAll({
                where: { 
                    is_verified_by_admin: true,
                    has_package: true
                },
                limit: 3,
                order: [['createdAt', 'DESC']]
            });
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
