'use strict';
const pg = require('pg');
const user = 'postgres';
const host = 'localhost';
const port = 5432;
const password = process.env.PG_PASS || 'YOUR_PASS';
const connectionString = 'postgres://' + user + ':' + password + '@' + host + ':' + port + '/' + 'oauth';

/**
 *
 * @param callback
 *      Returns the connection results (error, client object, and done object).
 *      Done Object should be used to end the connection after finished with CLient.
 */
exports.connect = function(callback) {
    // It's important to return the done callback here. We don't want to leave the connection open.
    pg.connect(connectionString, function(err, client, done) {
        if (err) {
            return callback(err);
        }
        return callback(null, client, done);
    });
};
