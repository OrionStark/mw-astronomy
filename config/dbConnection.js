const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const connection = (closure) => {
    return MongoClient.connect('mongodb://localhost:27017/astro-social', (err, db) => {
        if ( err ) { throw err };
        closure(db);
    });
};

module.exports = connection;