const User = require('./User');
const Content = require('./Content');
const ContentSlot = require('./ContentSlot');
const ContentSchedule = require('./ContentSchedule');

Content.belongsTo(User, { as: 'uploader', foreignKey: 'uploaded_by' });
Content.belongsTo(User, { as: 'approver', foreignKey: 'approved_by' });

ContentSchedule.belongsTo(Content, { foreignKey: 'content_id' });
Content.hasMany(ContentSchedule, { foreignKey: 'content_id' });

ContentSchedule.belongsTo(ContentSlot, { foreignKey: 'slot_id' });
ContentSlot.hasMany(ContentSchedule, { foreignKey: 'slot_id' });

module.exports = {
  User,
  Content,
  ContentSlot,
  ContentSchedule
};
