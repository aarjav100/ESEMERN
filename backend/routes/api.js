const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Auth routes (Public)
router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);

// Complaint routes (Protected)
router.get('/complaints/search', authMiddleware, complaintController.searchComplaintsByLocation);
router.post('/complaints', authMiddleware, complaintController.addComplaint);
router.get('/complaints', authMiddleware, complaintController.getComplaints);
router.put('/complaints/:id', authMiddleware, complaintController.updateComplaintStatus);
router.delete('/complaints/:id', authMiddleware, complaintController.deleteComplaint);

// AI & Chatbot routes (Protected)
router.post('/ai/analyze', authMiddleware, complaintController.analyzeComplaint);
router.post('/chat', authMiddleware, complaintController.chatWithBot);

module.exports = router;
