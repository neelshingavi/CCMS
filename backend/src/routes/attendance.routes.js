const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Demo Mode - wallet-based (no JWT required)
router.post('/mark', attendanceController.markAttendanceDemo);

// Authenticated endpoints (for production)
router.post('/mark/auth', authenticate, attendanceController.markAttendance);
router.get('/my', authenticate, attendanceController.getMyAttendance);

// Admin/Faculty endpoints
router.get('/event/:eventId', authenticate, authorize(['ADMIN', 'FACULTY', 'SUPER_ADMIN']), attendanceController.getAttendanceByEvent);

// Public verification - always accessible
router.get('/verify/:attendanceId', attendanceController.verifyAttendance);

module.exports = router;
