const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  title: {
    type: String,
    required: [true, 'Complaint title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Complaint description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  aiAnalysis: {
    urgency: {
      type: String,
      default: 'Medium'
    },
    department: {
      type: String,
      default: 'General Administration'
    },
    summary: {
      type: String,
      default: ''
    },
    autoResponse: {
      type: String,
      default: ''
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
