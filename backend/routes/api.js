const express = require('express');
const { generate, listHistory, getHistoryItem } = require('../controllers/aiController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/generate', generate);
router.get('/history', listHistory);
router.get('/history/:id', getHistoryItem);

module.exports = router;
