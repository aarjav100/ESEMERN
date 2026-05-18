const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');

router.post('/candidates', candidateController.addCandidate);
router.get('/candidates', candidateController.getCandidates);
router.get('/dashboard/stats', candidateController.getDashboardStats);
router.post('/match', candidateController.matchCandidates);
router.post('/ai/shortlist', candidateController.aiShortlist);
router.post('/chat', candidateController.chatWithBot);

module.exports = router;
