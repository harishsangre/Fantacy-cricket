const { type } = require('express/lib/response');
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    teamName: { type: String, required: true },
    players: [{ type: String, required: true }],
    captain: { type: String, required: true },
    viceCaptain: { type: String, required: true },
    totalPoints: { type: Number, default: 0 }
}, { collection: 'players' });

// module.exports = mongoose.model('Team', teamSchema);
// const playerSchema = new mongoose.Schema({
//     Player: String,
//     Team: String,
//     Role: String
// });

module.exports = mongoose.model('Team', teamSchema);
