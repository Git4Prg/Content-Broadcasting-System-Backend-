const { Content, ContentSlot, ContentSchedule } = require('../models');
const { successResponse, errorResponse } = require('../utils/response.util');

const getPendingContent = async (req, res) => {
  try {
    const contents = await Content.findAll({
      where: { status: 'pending' },
      order: [['created_at', 'ASC']]
    });
    
    successResponse(res, contents, 'Pending content fetched successfully');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

const getAllContent = async (req, res) => {
  try {
    const contents = await Content.findAll({
      order: [['created_at', 'DESC']]
    });
    
    successResponse(res, contents, 'All content fetched successfully');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

const approveContent = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await Content.findByPk(id);

    if (!content) {
      return errorResponse(res, 'Content not found', 404);
    }
    
    if (content.status !== 'pending') {
      return errorResponse(res, `Cannot approve content with status: ${content.status}`, 400);
    }

    content.status = 'approved';
    content.approved_by = req.user.id;
    content.approved_at = new Date();
    await content.save();

    // Scheduling Logic: Add to ContentSchedule
    // Find or create slot for the subject
    let slot = await ContentSlot.findOne({ where: { subject: content.subject } });
    if (!slot) {
      slot = await ContentSlot.create({ subject: content.subject });
    }

    // Get max rotation_order for this slot
    const maxOrderSchedule = await ContentSchedule.findOne({
      where: { slot_id: slot.id },
      order: [['rotation_order', 'DESC']]
    });

    const nextOrder = maxOrderSchedule ? maxOrderSchedule.rotation_order + 1 : 1;
    const duration = content.rotation_duration || 5;

    await ContentSchedule.create({
      content_id: content.id,
      slot_id: slot.id,
      rotation_order: nextOrder,
      duration: duration
    });

    successResponse(res, content, 'Content approved successfully');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

const rejectContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason) {
      return errorResponse(res, 'Rejection reason is required', 400);
    }

    const content = await Content.findByPk(id);

    if (!content) {
      return errorResponse(res, 'Content not found', 404);
    }

    if (content.status !== 'pending') {
      return errorResponse(res, `Cannot reject content with status: ${content.status}`, 400);
    }

    content.status = 'rejected';
    content.rejection_reason = rejection_reason;
    await content.save();

    successResponse(res, content, 'Content rejected successfully');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

module.exports = { getPendingContent, getAllContent, approveContent, rejectContent };
