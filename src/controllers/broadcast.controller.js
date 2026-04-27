const { Content, User, ContentSchedule } = require('../models');
const { Op } = require('sequelize');

const getLiveContent = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { subject } = req.query;

    const teacher = await User.findOne({ where: { id: teacherId, role: 'teacher' } });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const now = new Date();

    // Find all approved content for this teacher that is currently active (within start_time and end_time)
    const whereClause = {
      uploaded_by: teacherId,
      status: 'approved',
      start_time: { [Op.lte]: now },
      end_time: { [Op.gte]: now }
    };

    if (subject) {
      whereClause.subject = subject;
    }

    const activeContents = await Content.findAll({
      where: whereClause,
      include: [{
        model: ContentSchedule,
        required: true // Must have a schedule
      }]
    });

    if (!activeContents || activeContents.length === 0) {
      return res.status(200).json({ message: "No content available" });
    }

    // Group contents by subject
    const contentsBySubject = activeContents.reduce((acc, content) => {
      if (!acc[content.subject]) {
        acc[content.subject] = [];
      }
      acc[content.subject].push(content);
      return acc;
    }, {});

    const { determineActiveContent } = require('../services/scheduling.service');
    const liveContents = determineActiveContent(contentsBySubject, now);

    if (liveContents.length === 0) {
      return res.status(200).json({ message: "No content available" });
    }

    res.status(200).json({
      success: true,
      data: liveContents
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getLiveContent };
