'use strict';
const pg = require('../../database/pg_connect.js');
const jwt = require('jsonwebtoken');

/**
 *
 * User Login function. Checks the database for the username/password combination and returns either true or false.
 *
 *  This function may fail for several reasons:
 *
 *  Invalid Param               The username is not a valid username string.
 *  Invalid propertyName        There is a non-valid parameter in the request (aka something that shouldn't be there).
 *  TimeoutError                The Database takes too long to return.
 *  SystemError                 The Database refuses the connection.
 *  Incorrect U/P               The user provided the incorrect credentials.
 *
 */
module.exports = function(req, res, next) {
    //assert.equal(typeof username, 'string', "Username must be a string with no invalid characters.");
    //assert.equal(typeof password, 'string', "password must be a string type");
    //assert.equal(typeof next, 'function', 'callback must be a function');

    const username = req.body.username;
    const password = req.body.password;
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
            // Remember to not store this secret in your production application code. You need to abstract it into an environment variable that is only accessible
            // via the server (such as in a process variable).
            var token = jwt.sign(user, 'tempsecret', {
                // Change this to however you want.
                expiresIn: 4320
            });
            return res.json({token : token});
        });
    });
};