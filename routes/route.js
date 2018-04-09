const express = require('express');
const router = express.Router;
const sunController = require('../controllers/suncalculation');


router.get('/sun/position', (req, res) => {
    var date = req.body.date;
    
});