const { Content, ContentSchedule } = require('../models');

const determineActiveContent = (contentsBySubject, now) => {
  const liveContents = [];

  for (const [subj, contents] of Object.entries(contentsBySubject)) {
    contents.sort((a, b) => a.ContentSchedules[0].rotation_order - b.ContentSchedules[0].rotation_order);
    
    const cycleItems = contents.map(c => ({
      content: c,
      durationMs: c.ContentSchedules[0].duration * 60 * 1000
    }));

    const totalCycleMs = cycleItems.reduce((sum, item) => sum + item.durationMs, 0);

    const nowMs = now.getTime();
    const currentPositionMs = nowMs % totalCycleMs;

    let accumulatedMs = 0;
    let activeItem = null;

    for (const item of cycleItems) {
      accumulatedMs += item.durationMs;
      if (currentPositionMs < accumulatedMs) {
        activeItem = item.content;
        break;
      }
    }

    if (activeItem) {
      liveContents.push({
        id: activeItem.id,
        title: activeItem.title,
        description: activeItem.description,
        subject: activeItem.subject,
        file_url: activeItem.file_url,
        file_type: activeItem.file_type
      });
    }
  }

  return liveContents;
};

module.exports = { determineActiveContent };
