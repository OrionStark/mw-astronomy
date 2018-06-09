const suncalcController = require('../controllers/suncalculation');
const user = require('../controllers/user');
const nasa = require('../controllers/nasa');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

module.exports = (app) => {
    app.all('/*', routeSecure);
    app.get('/nasa/neo/today', getNearEarthObjectToday);
    app.get('/nasa/neo/bydate/:start_date/:end_date', getNearEarthObjectbyDate);
    app.post('/user/login', userLogin);
    app.post('/user/register', userRegister);
    app.post('/user/addFriends', userAddFriends);
    app.post('/user/confirm-friend-request', confirmFriendRequest );
    app.post('/user/delete-friend', userDeleteFriend);
};

/**
 * Check user auth for accessing all features
 * @param {Object} req 
 * @param {Object} res 
 */
function routeSecure(req, res) {
    if ( req.headers.authToken ) {
        jwt.verify(req.headers.authToken, config.secret_key, (err, decoded) => {
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

function userDeleteFriend(req, res) {
    let data = req.body;
    user.deleteFriend(data.username, data.userToDelete)
        .then((response) => {
            res.status(response.statuscode).json(response);
        })
        .catch((err) => {
            res.status(501).send(err.message);
        })
}

function confirmFriendRequest(req, res) {
    let data = req.body;
    user.acceptFriendRequest(data.username, data.userToConfirm)
        .then((response) => {
            res.status(response.statuscode).json(response);
        })
        .catch((err) => {
            res.status(501).send(err.message)
        })
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

function userAddFriends(req, res) {
    let data = req.body;
    user.addFriends(data.user, data.userToAdd)
        .then((response) => {
            res.status(response.statuscode).json(response);
        })
        .catch((err) => {
            res.status(501).send(err.message);
        });
}