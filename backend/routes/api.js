const express = require('express');
const { generate, listHistory, getHistoryItem, deleteHistoryItem } = require('../controllers/aiController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/generate', generate);
router.get('/history', listHistory);
router.get('/history/:id', getHistoryItem);
router.delete('/history/:id', deleteHistoryItem);

module.exports = router;
