// // API Route (leads.js)
// import express from 'express';
// import Lead from '../models/Lead';
const express = require('express')
const Lead = require('../models/Lead')


const router = express.Router();

// Create new lead
router.post('/api/leads', async (req, res) => {
    try {
        const lead = new Lead(req.body);
        await lead.save();
        res.status(201).json(lead);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all leads
router.get('/api/leads', async (req, res) => {
    try {
        const leads = await Lead.find().sort({ createdAt: -1 });
        res.json(leads);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router