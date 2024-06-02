const Match = require('../models/Match');
const User = require('../models/User');
const Team = require('../models/Team');

// Define the point system
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
        }

    } catch (error) {
        console.error(error);
    }
};
processResult()
module.exports =  processResult()
