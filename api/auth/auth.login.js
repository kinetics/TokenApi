'use strict';
const pg = require('../../database/pg_connect.js');
const jwt = require('jsonwebtoken');

/**
 *
 * User Login function. Checks the database for the username/password combination and returns either true or false.
 *
 */
module.exports = function(req, res, next) {
    
    const username = req.body.username;
    const password = req.body.password;

    // Cleanup.
    req.body.username = '';
    req.body.password = '';

    // Verifies that the credentials exist and are a match. Returns TRUE if so, otherwise null / false.
    pg.connect(function (err, client, done) {
        if (err) return next(err);
        client.query('SELECT * from userLogin($1, $2)', [username, password], function (pgerr, result) {
            done();
            if (pgerr) {
                return next(err);
            }
            const user = result.rows[0];
            if (user.userlogin === false) {
                return next(null, 401);
            } else if (user.userlogin === null) {
                return next(null, 401);
            }
            var token = jwt.sign(user, 'tempsecret', {
                // Change this to however you want.
                expiresIn: 4320
            });
            return res.json({token : token});
        });
    });
};