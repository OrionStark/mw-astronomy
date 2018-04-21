const dbConnection = require('../config/dbConnection');
const config = require('../config/config');
const q = require('q');
const bcrypt = require('bcryptjs');


function createUser(data) {
    let holdPromises = q.defer();

    /**
     * @param {string} password Your Password
     * 
     * @return {string} hash 
     */
    function encryptPass(password) {
        bcrypt.genSalt(config.saltRounds, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                return hash;
            });
        });
    }

    function checkUsername(username) {
        dbConnection((db) => {
            db.collection('user')
                .findOne({username: username}, (err, result) => {
                    if ( result ) {
                        holdPromises.resolve(
                            {
                                status: "Register Failed",
                                message: "Your username has been taken by someone"
                            }
                        );
                        return false;
                    } else {
                        return true;
                    }
                });
        });
    }

    if ( checkUsername(data.username) ) {
        data.password = encryptPass(data.password);
        dbConnection((db) => {
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

    return holdPromises.promise;
}