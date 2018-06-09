const dbConnection = require('../config/dbConnection');
const config = require('../config/config');
const q = require('q');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
    register: createUser,
    login: login,
    addFriends: addFriends,
    acceptFriendRequest: acceptFriendRequest,
    deleteFriend: deleteFriend,
    checkUserExixstend: checkUserExixstend
};

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
                            }
                        });
                    });
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
            });
    });
    return holdPromises.promise;
}

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
                        message: "You're username is not valid, please check it back"
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

function addFriends(username, newfriend) {
    let holdPromises = q.defer();
    dbConnection((db) => {
        db.collection('user')
            .findOne({username: username}, (err, result) => {
                let status = false;
                let message = "";
                for ( let i = 0; i < result.friends.length; i++ ) {
                    if ( result.friends[i].username == newfriend
                        && result.friends[i].status == "pending" ) {
                        status = true;
                        message = "You already added " + newfriend + 
                        " as a friend and waiting for confirmation";
                        break;
                    } else if ( result.friends[i].username == newfriend
                        && result.friends[i].status == "waiting for your confirm" ) {
                        status = true;
                        message = "Actually " + newfriend + " already ask you to become a friend";
                        break;
                    } else if ( result.friends[i].username == newfriend
                        && result.friends[i].status == "accepted" ) {
                        status = true;
                        message = "Already your friends";
                        break;
                    }
                }
                if ( !status ) {
                    getUserbyUsername(newfriend, (err, res) => {
                        if ( res ) {
                            let data = {
                                name: res.name,
                                username: res.username,
                                email: res.email,
                                status: "pending"
                            }
                            result.friends.push(data);
                            pushFriend(username, result.friends, (err, response) => {
                                if ( response ) {
                                    let dataForfriend = {
                                        name: result.name,
                                        username: result.username,
                                        email: result.email,
                                        status: "waiting for your confirm"
                                    };
                                    res.friends.push(dataForfriend);
                                    pushFriend(newfriend, res.friends, (err, responseData) => {
                                        if ( !err ) {
                                            holdPromises.resolve(
                                                {
                                                    statuscode: 200,
                                                    message: "Friend added"
                                                }
                                            )
                                        } else {
                                            holdPromises.resolve({
                                                statuscode: 200,
                                                message: "Error on put friend to the list"
                                            })
                                        }
                                    });
                                } else {
                                    holdPromises.resolve({
                                        statuscode: 200,
                                        message: "Friends and the username not found."
                                    });
                                }
                            });
                        } else {
                            holdPromises.resolve({
                                statuscode: 200,
                                message: "There's no user."
                            });
                        }
                    });
                } else {
                    holdPromises.resolve(
                        {
                            statuscode: 200,
                            message: message
                        }
                    )
                }
            })
    })
    
    return holdPromises.promise;
}
/**
 * 
 * @param {string} username who is the user
 * @param {*} friends user friends data
 * @param {*} callbacks callbacks
 */
function pushFriend(username, friends, callbacks) {
    dbConnection((db) => {
        db.collection('user')
            .updateOne({username: username}, {$set: {friends: friends} }, (err, result) => {
                callbacks(err, result);
            });
    });
}

function acceptFriendRequest(username, usernameToAccept) {
    let holdPromises = q.defer();
    dbConnection((db) => {
        db.collection('user')
            .findOne({username: username}, (err, result) => {
                if ( err ) {
                    holdPromises.resolve({ status: false, statuscode: 501, 
                        message: "There's an error, please try it again later" });
                } else {
                    if ( result ) {
                        let friendsData = result.friends;
                        for ( let i = 0; i < friendsData.length; i++ ) {
                            if ( friendsData[i].username == usernameToAccept
                                && friendsData[i].status == "waiting for your confirm" ) {
                                friendsData[i].status = "accepted";
                                break;
                            } 
                        }
                        pushFriend(username, friendsData, (err, res) => {
                            if ( err ) {
                                holdPromises.resolve({ status: false, statuscode: 200, 
                                    message: "We got some errors, please try it again later." });
                            } else {
                                getUserbyUsername(usernameToAccept, (err, result) => {
                                    if ( result ) {
                                        let friendsResult = result.friends;
                                        for ( let i = 0; i < friendsResult.length; i++ ) {
                                            if ( friendsResult[i].username == username 
                                                && friendsResult[i].status == "pending" ) {
                                                friendsResult[i].status = "accepted";
                                                break;
                                            }
                                        }
                                        pushFriend(usernameToAccept, friendsResult, (err, response) => {
                                            if ( err ) {
                                                holdPromises.resolve({
                                                    status: false,
                                                    statuscode: 501,
                                                    message: "Error encountered, please try it again later"
                                                });
                                            } else {
                                                holdPromises.resolve({
                                                    status: true,
                                                    statuscode: 200,
                                                    message: "Confirmation completed"
                                                })
                                            }
                                        });
                                    } else {
                                        /* We will add delete function here. But not now */
                                        holdPromises.resolve({
                                            status: false,
                                            statuscode: 200,
                                            message: "User not found, we will delete the data"
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        holdPromises.resolve({
                            status: false,
                            statuscode: 200,
                            message: "We can't find your data."
                        });
                    }
                }
            });
    });

    return holdPromises.promise;
}

/**
 * This method is for deleting a friend, of a friend list
 * @param {string} username your username 
 * @param {*} userTodelete username to delete
 */
function deleteFriend(username, userTodelete) {
    let holdPromises = q.defer();
    getUserbyUsername(username, (err, res) => {
        if ( !err ) {
            let friends = res.friends;
            for ( let i = 0; i < friends.length; i++ ) {
                if ( friends[i].username == userTodelete ) {
                    friends.splice(i, 1);
                    break;
                }
            }
            pushFriend(username, friends, (err, result) => {
                if ( err ) {
                    holdPromises.resolve({
                        statuscode: 200,
                        message: "Internal error, try it again later"
                    });
                } else {
                    getUserbyUsername(userTodelete, (err, data) => {
                        if ( data ) {
                            let friends = data.friends;
                            for ( let i = 0; i < friends.length; i++ ) {
                                if ( friends[i].username == username ) {
                                    friends.splice(i, 1);
                                    break;
                                }
                            }
                            pushFriend(userTodelete, friends, (err, res) => {
                                if ( res ) {
                                    holdPromises.resolve({
                                        statuscode: 200,
                                        message: "Delete friend succeed"
                                    });
                                } else {
                                    if ( err ) {
                                        holdPromises.resolve({
                                            statuscode: 200,
                                            message: "Error encountered"
                                        });
                                    } else {
                                        holdPromises.resolve({
                                            statuscode: 200,
                                            message: "User not found"
                                        });
                                    }
                                }
                            })
                        } else {
                            holdPromises.resolve({
                                statuscode: 200,
                                message: "User to delete not found"
                            });
                        }
                    });
                }
            });
        } else {
            holdPromises.resolve({
                statuscode: 200,
                message: "User not found"
            });
        }
    });

    return holdPromises.promise;
}

function getUserbyUsername(username, callbacks) {
    dbConnection((db) => {
        db.collection('user')
            .findOne({username: username}, (err, result) => {
                if ( err ) return callbacks("Error", null);
                callbacks(null, {
                    username: result.username,
                    email: result.email,
                    friends: result.friends,
                    name: result.name
                });
            });
    });
}

function checkAlreadyFriend(username, usertoadd, callbacks) {
    dbConnection((db) => {
        db.collection('user')
            .findOne({username: username}, (err, res) => {
                if ( err ) {
                    throw err;
                } else {
                    console.log(res);
                    if ( res.friends.length > 0 ) {
                        for ( let i = 0; i < res.friends.length; i++ ) {
                            if ( res.friends[i].username == usertoadd 
                                && res.friends[i].status == "accepted" ) {
                                callbacks(true, {
                                    statuscode: 200,
                                    message: usertoadd + " is already your friends"
                                });
                                break;
                            } else if ( res.friends[i].username == usertoadd && 
                                        res.friends[i].status == "pending" ) {
                                callbacks(true, {
                                    statuscode: 200,
                                    message: "You already added " + usertoadd + " as a friend, but it's waiting for confimation"
                                });
                                break;
                            }else if ( res.friends[i].username == usertoadd && 
                                res.friends[i].status == "waiting for your confirm" ) {
                                callbacks(true, {
                                    statuscode: 200,
                                    message: usertoadd + " already add you as a friend and waiting for your confirmation"
                                });
                                break;
                            } else {
                                callbacks(false, {
                                    statuscode: 200,
                                    message: "Error"
                                });
                            }
                        }
                    } else {
                        callbacks(false, {
                            statuscode: 200,
                            message: "Error"
                        });
                    }
                }
            })
    });
}

/**
 * 
 * @param {*} username 
 * @param {*} callback 
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