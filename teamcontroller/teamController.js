
// const teamRoutes = require('./routes/teamRoutes');
const Team = require('../models/Team');
const User = require('../models/Registration');
const fs = require('fs');
const path = require('path');

const validateTeam = async (team) => {
    if (!Array.isArray(team.players) || team.players.length !== 11) {
        return 'A team must have exactly 11 players';
    }

    const playerCounts = {};
    let roleCounts = { WK: 0, BAT: 0, AR: 0, BWL: 0 };

    // Map the role names to the keys used in roleCounts
    const roleMapping = {
        'WICKETKEEPER': 'WK',
        'BATTER': 'BAT',
        'ALL-ROUNDER': 'AR',
        'BOWLER': 'BWL'
    };

    for (let playerName of team.players) {
        const player = await Team.findOne({ Player: playerName });

        if (!player) {
            return `Player ${playerName} does not exist`;
        }

        const playerObj = player.toObject();

        if (!playerCounts[playerObj.Team]) {
            playerCounts[playerObj.Team] = 0;
        }
        playerCounts[playerObj.Team]++;

        if (playerCounts[playerObj.Team] > 10) {
            return `A team cannot have more than 10 players from the same team (${playerObj.Team})`;
        }

        const roleKey = roleMapping[playerObj.Role];
        if (!roleKey) {
            return `Invalid role ${playerObj.Role} for player ${playerName}`;
        }

        roleCounts[roleKey]++;
    }


    if (roleCounts.WK < 1 || roleCounts.WK > 8) {
        return 'A team must have between 1 and 8 wicket keepers';
    }
    if (roleCounts.BAT < 1 || roleCounts.BAT > 8) {
        return 'A team must have between 1 and 8 batters';
    }
    if (roleCounts.AR < 1 || roleCounts.AR > 8) {
        return 'A team must have between 1 and 8 all-rounders';
    }
    if (roleCounts.BWL < 1 || roleCounts.BWL > 8) {
        return 'A team must have between 1 and 8 bowlers';
    }

    if (!team.players.includes(team.captain)) {
        return 'Captain must be one of the players in the team';
    }
    if (!team.players.includes(team.viceCaptain)) {
        return 'Vice-Captain must be one of the players in the team';
    }

    return null;
};

exports.addteam = async (req, res) => {
console.log(req.body,'reeeeeee')
const { teamName, players, captain, viceCaptain,email,totalpoints } = req.body;

    if (!teamName || !players || !captain || !viceCaptain) {
        return res.status(400).json({ error: 'All fields are required' });
    } 

    const team = { teamName, players, captain, viceCaptain,totalpoints };
    const validationError = await validateTeam(team);
    if (validationError) {
        return res.status(400).json({ error: validationError,player:players });
    } 
    const user = await User.findOne({ email });
    const newTeam = new Team(team);
    console.log(newTeam,'tttttttt')

    try {
        const updatedUser = await User.findOneAndUpdate(
            { email },
            { $push: { teams: newTeam } },
            { new: true }
        );
       await processResult()
        res.status(201).json({ message: 'Team added successfully', team: newTeam });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add team' });
    }
}

const points = {
    Batting: {
        Run: 1,
        BoundaryBonus: 1,
        SixBonus: 2,
        Run30Bonus: 4,
        HalfCenturyBonus: 8,
        CenturyBonus: 16,
        DuckPenalty: -2
    },
    Bowling: {
        Wicket: 25,
        Bonus: 8,
        ThreeWicketBonus: 4,
        FourWicketBonus: 8,
        FiveWicketBonus: 16,
        MaidenOverBonus: 12
    },
    Fielding: {
        Catch: 8,
        ThreeCatchBonus: 4,
        Stumping: 12,
        RunOut: 6
    }
};



const updatePlayerPoints = (playerPoints, playerName, pointsToAdd) => {
    if (!playerPoints[playerName]) {
        playerPoints[playerName] = 0;
    }
    playerPoints[playerName] += pointsToAdd;
};
const processResult = async () => {
    try {
        // Load match data
        const matchDataPath = path.join(__dirname, '../data/match.json');
        const deliveries = JSON.parse(fs.readFileSync(matchDataPath, 'utf8'));

        const playerPoints = {};

        // Process each delivery
        deliveries.forEach(delivery => {
            // Calculate batting points
            updatePlayerPoints(playerPoints, delivery.batter, delivery.batsman_run * points.Batting.Run);
            if (delivery.batsman_run === 4) {
                updatePlayerPoints(playerPoints, delivery.batter, points.Batting.BoundaryBonus);
            }
            if (delivery.batsman_run === 6) {
                updatePlayerPoints(playerPoints, delivery.batter, points.Batting.SixBonus);
            }

            // Calculate bowling points
            if (delivery.isWicketDelivery) {
                updatePlayerPoints(playerPoints, delivery.bowler, points.Bowling.Wicket);
                if (delivery.kind === 'bowled' || delivery.kind === 'lbw') {
                    updatePlayerPoints(playerPoints, delivery.bowler, points.Bowling.Bonus);
                }
            }

            // Calculate fielding points
            if (delivery.kind === 'caught') {
                updatePlayerPoints(playerPoints, delivery.fielders_involved, points.Fielding.Catch);
            }
            if (delivery.kind === 'stumped') {
                updatePlayerPoints(playerPoints, delivery.fielders_involved, points.Fielding.Stumping);
            }
            if (delivery.kind === 'run out') {
                updatePlayerPoints(playerPoints, delivery.fielders_involved, points.Fielding.RunOut);
            }
        });

        // Update team entries with the calculated points
        for (const playerName in playerPoints) {
            const pointsScored = playerPoints[playerName];
            await User.updateMany(
                { 'teams.players': playerName },
                { $inc: { 'teams.$.totalPoints': pointsScored } }
            );
            // console.log(pointsScored,'ppp',playerName)
        }

    } catch (error) {
        console.error(error);
    }
};
// module.exports = { addteam }; 



