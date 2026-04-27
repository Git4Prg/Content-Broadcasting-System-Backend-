const express = require('express');
const { getPendingContent, getAllContent, approveContent, rejectContent } = require('../controllers/approval.controller');
const { authenticate, authorizeRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate, authorizeRole('principal'));

router.get('/pending', getPendingContent);
router.get('/all', getAllContent);
router.put('/:id/approve', approveContent);
router.put('/:id/reject', rejectContent);

module.exports = router;
