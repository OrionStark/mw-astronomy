const suncalcController = require('../controllers/suncalculation');

module.exports = (app) => {
    app.get('/nasa/neo/today', getNearEarthObjectToday);
};

function getNearEarthObjectToday(req, res) {
    //
}