const dbConnection = require('../config/dbConnection');
const config = require('../config/config');
const q = require('q');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
    register: createUser,
    login: login,
    checkUserExixstend: checkUserExixstend
};

/**
 * 
 * @param {Object} data {name, username, email, password} 
 */
function createUser(data) {
    let holdPromises = q.defer();
    dbConnection((db) => {
        db.collection('user')
            .findOne({username: data.username}, (err, result) => {
                if ( result ) {
                    holdPromises.resolve(
                        {
                            statuscode: 401,
                            status: "Register Failed",
                            message: "Your username has been taken by someone"
                        }
                    );
                } else if ( err ) {
                    holdPromises.resolve({
                        statuscode: 501,
                        status: "Register Failed",
                        message: "We can't store your data into out database, try again later"
                    });
                } else {
                    bcrypt.genSalt(config.saltRounds, (err, salt) => {
                        bcrypt.hash(data.password, salt, (err, hash) => {
                            if ( err ) {
                                holdPromises.reject("False");
                            } else {
                                data.password = hash;
                                dbConnection((db) => {
                                    console.log(data)
                                    db.collection('user')
                                        .insertOne(data, (err, res) => {
                                            if ( err ) {
                                                holdPromises.resolve({
                                                    status: "Register Failed",
                                                    message: "We can't store your data into out database, try again later"
                                                });
                                            } else {
                                                holdPromises.resolve({
                                                    status: "Register succeed",
                                                    message: "Welcome to astronomy social"
                                                });
                                            }
                                        });
                                });
                            }
                        });
                    });
                }
            });
    });
    return holdPromises.promise;
}

/**
 * Login Model
 * @param {Object} data {username, password}
 */
function login(data) {
    let holdPromises = q.defer();
    dbConnection((db) => {
        db.collection('user')
            .findOne({username: data.username}, (err, response) => {
                if ( err ) { 
                    holdPromises.resolve({
                        statuscode: 503,
                        status: "Login failed",
                        message: "Sorry we got some errors, please try again later."
                    });

                }
                if ( !response ) {
                    holdPromises.resolve({
                        statuscode: 401,
                        status: "Login failed",
                        message: "Your username is not valid, please check it back"
                    });
                } else {
                    bcrypt.compare(data.password, response.password, (err, status) => {
                        if ( err ) {
                            holdPromises.resolve({
                                statuscode: 503,
                                status: "Login failed",
                                message: "Sorry we got some errors, please try again later."
                            });
                        }
                        if ( !status ) {
                            console.log(response.password)
                            holdPromises.resolve({
                                statuscode: 401,
                                status: "Login failed",
                                message: "Your password is not valid, please check it back"
                            })
                        } else {
                            let token = jwt.sign({username: response.username}, config.secret_key, {expiresIn: 86400})
                            holdPromises.resolve({
                                statuscode: 200,
                                status: "Login succeed",
                                message: "Welcome " + response.name,
                                data: response,
                                api_token: token
                            });
                        }
                    })
                }
            })
    });

    return holdPromises.promise;
}

/**
 * User checking
 * @param {*} username User usename
 * @param {*} callback Handling callback
 */
function checkUserExixstend(username, callback) {
    dbConnection((db) => {
        db.collection('user')
            .findOne({username: username}, (err, result) => {
                if ( err ) {
                    callback(false);
                }
                if ( result ) {
                    callback(true);
                } else {
                    callback(false);
                }
            })
    })
}