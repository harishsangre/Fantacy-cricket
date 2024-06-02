const express = require('express');
const router = express.Router();
const MatchResult = require('../models/MatchResult');
const Team = require('../models/Team');

// Create a new match result
router.post('/', async (req, res) => {
  try {
    const matchResult = new MatchResult(req.body);
    const savedMatchResult = await matchResult.save();
    res.status(201).json(savedMatchResult);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get results for a team
router.get('/team/:teamId', async (req, res) => {
  try {
    const results = await MatchResult.find({ teamId: req.params.teamId });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
