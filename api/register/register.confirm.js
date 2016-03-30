'use strict';

const pg = require('../../database/pg_connect.js');
const jwt = require('jsonwebtoken');
const verify = 'temptoken';

module.exports = function (req, res, next) {
    const token = req.params.token;
    if (token) {
        jwt.verify(token, verify, function(err, decoded) {
            if (err) {
                return res.status(401).send('Unauthorized');
            }
            req.decoded = decoded;
            const userID = req.decoded.userID;

            pg.connect(function (pgErr, client, done) {
                if (pgErr) return next(pgErr);
                client.query('UPDATE logins SET validated = $1 WHERE userID = $2', [true, userID], function (clientErr, result) {
                    done();
                    if (clientErr) {
                        console.log(clientErr);
                        return next(err);
                    }
                    return res.json({message: 'Email validated.'})
                });
            });
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
};