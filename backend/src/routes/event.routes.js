const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const logger = require('../config/logger');

// Get all events - PROTECTED
router.get('/', authenticate, async (req, res) => {
    try {
        const events = await Event.findAll({
            order: [['startTime', 'DESC']]
        });
        res.json(events);
    } catch (error) {
        logger.error('Get Events Error:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// Get single event - PROTECTED
router.get('/:eventId', authenticate, async (req, res) => {
    try {
        const event = await Event.findOne({ where: { eventId: req.params.eventId } });
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        logger.error('Get Event Error:', error);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
});

// Create event - PROTECTED (Admin/Faculty only)
router.post('/', authenticate, authorize(['ADMIN', 'FACULTY', 'SUPER_ADMIN']), async (req, res) => {
    try {
        const { title, description, startTime, endTime, organizerWallet } = req.body;

        if (!title || !startTime || !endTime) {
            return res.status(400).json({ error: 'Missing required fields: title, startTime, endTime' });
        }

        // Generate unique event ID
        const eventId = `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const event = await Event.create({
            eventId,
            title,
            description: description || '',
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            organizerWallet: organizerWallet || req.user?.wallet_address || 'SYSTEM'
        });

        res.status(201).json({ message: 'Event created', event });
    } catch (error) {
        logger.error('Create Event Error:', error);
        res.status(500).json({ error: 'Failed to create event: ' + error.message });
    }
});

// Create event - DEMO MODE (wallet-only, no JWT) 
// This allows the demo to work without full auth setup
router.post('/demo', async (req, res) => {
    try {
        const { title, description, startTime, endTime, organizerWallet } = req.body;

        if (!title || !startTime || !endTime) {
            return res.status(400).json({ error: 'Missing required fields: title, startTime, endTime' });
        }

        if (!organizerWallet) {
            return res.status(400).json({ error: 'Wallet address required' });
        }

        const eventId = `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const event = await Event.create({
            eventId,
            title,
            description: description || '',
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            organizerWallet
        });

        res.status(201).json({ message: 'Event created', event });
    } catch (error) {
        logger.error('Create Event (Demo) Error:', error);
        res.status(500).json({ error: 'Failed to create event: ' + error.message });
    }
});

module.exports = router;
