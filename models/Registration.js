const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teamSchema = new Schema({
    teamName: { type: String, required: true },
    players: { type: [String], required: true },
    captain: { type: String, required: true },
    viceCaptain: { type: String, required: true },
    totalPoints: { type: Number, default: 0 }
});

const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    teams: { type: [teamSchema], default: [] }
});

module.exports = mongoose.model('User', userSchema);
