const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect('YOUR_MONGODB_CONNECTION_STRING', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Routes
const teamRoutes = require('./routes/teamRoutes');
const matchResultRoutes = require('./routes/matchResultRoutes');

// app.use('/api/teams', teamRoutes);
// app.use('/api/match-results', matchResultRoutes);
app.use('/api', teamRoutes);
app.get('/', (req, res) => {
  res.send('Hello, Fantasy Cricket App!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
