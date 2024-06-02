require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');


const uri = "mongodb+srv://harishsangre00:9977303453hH@f1.l0jaxsd.mongodb.net/task-?retryWrites=true&w=majority&appName=F1"
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB Atlas');
        // Start your server after successful connection
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB Atlas', err);
    });


  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors());
  const teamRoutes = require('./routes/teamRoutes');
  app.use('/api', teamRoutes);

  const playerSchema = new mongoose.Schema({
    Player: String,
    Team: String,
    Role: String
}, { collection: 'players' });
  const Player = mongoose.model('Player', playerSchema);
  
  const importPlayers = async () => {
      const jsonFilePath = path.join(__dirname, 'data', 'players.json'); // Adjust the path to your file
      const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
      console.log(jsonData.length,'jdata')
      try {
          await Player.insertMany(jsonData);
          console.log('Players data imported successfully');
      } catch (err) {
          console.error('Failed to import players data', err);
      } finally {
          mongoose.disconnect();
      }
  };
  
//   importPlayers();

  const matchSchema = new mongoose.Schema({
    ID: Number,
    innings: Number,
    overs: Number,
    ballnumber: Number,
    batter: String,
    bowler: String,
    non_striker: String,
    extra_type: String,
    batsman_run: Number,
    extras_run: Number,
    total_run: Number,
    non_boundary: Number,
    isWicketDelivery: Number,
    player_out: String,
    kind: String,
    fielders_involved: String,
    BattingTeam: String
}, { collection: 'matchResults' });

const Match = mongoose.model('Match', matchSchema);

const importMatchData = async () => {
    const jsonFilePath = path.join(__dirname, 'data', 'match.json'); // Adjust the path to your file
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
    
    try {
        await Match.insertMany(jsonData);
        console.log('Match data imported successfully');
    } catch (err) {
        console.error('Failed to import match data', err);
    } finally {
        mongoose.disconnect();
    }
};

// importMatchData();

