const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const teamcontroller = require('../teamcontroller/teamController')
const registrationcontroller = require('../teamcontroller/userRegistration')
const loginController = require('../teamcontroller/login')

// Create a new team
router.post('/user-registration', registrationcontroller.userregistration);
router.post('/login', loginController.login);
router.post('/add-team', teamcontroller.addteam);

// Get all teams

module.exports = router;
