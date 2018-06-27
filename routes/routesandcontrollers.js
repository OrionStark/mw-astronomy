const suncalcController = require('../models/suncalculation');
const user = require('../models/user');
const nasa = require('../models/nasa');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

module.exports = (app) => {
    app.all('/*', routeSecure);
    app.get('/', getHome)
    app.get('/nasa/neo/today', getNearEarthObjectToday);
    app.get('/nasa/neo/bydate/:start_date/:end_date', getNearEarthObjectbyDate);
    app.post('/user/login', userLogin);
    app.post('/user/register', userRegister);
};

/**
 * Check user auth for accessing all features
 * @param {Object} req 
 * @param {Object} res 
 */
function routeSecure(req, res, next) {
    if ( req.path === '/user/register' || req.path === '/user/login' || req.path === '/' ) {
        next()
    } else {
        if ( req.headers.authorization ) {
            jwt.verify(req.headers.authorization, config.secret_key, (err, decoded) => {
                user.checkUserExixstend(decoded.username, (status) => {
                    if (status) {
                        next();
                    } else {
                        res.status(401).json({
                            status: false,
                            message: "You're not allowed to do this"
                        });
                    }
                });
            });
        } else {
            res.status(401).json({
                status: false,
                message: "You're not allowed to do this"
            });
        }
    }
}

function getHome(req, res) {
    res.send("Hello there, It's me OrionStark. Any advices or problems?. Contact me on email: robbybellamy6@gmail.com, IG: orionoscode.")
}

function getNearEarthObjectToday(req, res) {
    nasa.todayNeo()
        .then((response) => {
            res.json(response);
        })
        .catch((err) => {
            res.status(501).send(err.message);
        })
}

function getNearEarthObjectbyDate(req, res) {
    nasa.neoByDate(req.params.start_date, req.params.end_date)
        .then((response) => {
            res.json(response);
        })
        .catch((err) => {
            res.status(501).send(err.message);
        })
}

function userLogin(req, res) {
    let data = req.body;
    user.login(data)
        .then((response) => {
            res.status(response.statuscode).json(response);
        })
        .catch((err) => {
            res.status(501).send(err.message)
        });
}

function userRegister(req, res) {
    let data = req.body;
    user.register(data)
        .then((response) => {
            res.json(response);
        })
        .catch((err) => {
            res.status(501).send(err.message);
        });
}