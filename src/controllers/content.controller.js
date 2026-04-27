const { Content } = require('../models');
const { successResponse, errorResponse } = require('../utils/response.util');

const uploadContent = async (req, res) => {
  try {
    const { title, subject, description, start_time, end_time, rotation_duration } = req.body;
    const file = req.file;

    if (!title || !subject || !file) {
      return errorResponse(res, 'Title, subject, and file are mandatory', 400);
    }

    const content = await Content.create({
      title,
      description,
      subject,
      file_url: file.path,
      file_type: file.mimetype,
      file_size: file.size,
      uploaded_by: req.user.id,
      status: 'pending',
      start_time: start_time ? new Date(start_time) : null,
      end_time: end_time ? new Date(end_time) : null,
      rotation_duration: rotation_duration ? parseInt(rotation_duration) : null
    });

    successResponse(res, content, 'Content uploaded successfully and is pending approval', 201);
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

const getTeacherContent = async (req, res) => {
  try {
    const contents = await Content.findAll({
      where: { uploaded_by: req.user.id },
      order: [['created_at', 'DESC']]
    });
    
    successResponse(res, contents, 'Teacher content fetched successfully');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

module.exports = { uploadContent, getTeacherContent };
