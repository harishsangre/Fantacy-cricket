const mongoose = require('mongoose');

const matchResultSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  points: { type: Number, required: true },
});

module.exports = mongoose.model('MatchResult', matchResultSchema);
