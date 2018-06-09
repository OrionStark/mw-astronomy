const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

/**
 * Harusnyasih pake method transaction begin and ended. Tapi udah terlanjur
 * semua user model make gini. Mau ngubah jadi males :(. Mana lagi user modelnya banyak
 * @param {*} closure 
 */
const connection = (closure) => {
    return MongoClient.connect('mongodb://localhost:27017', (err, client) => {
        if ( err ) { throw err };
        const db = client.db('astro-social');
        closure(db);
    });
};

module.exports = connection;