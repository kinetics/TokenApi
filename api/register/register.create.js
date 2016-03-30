'use strict';
const SparkPost = require('sparkpost');
// TODO: Move to env variable.
const spark_token = process.env.SPARK_TOKEN || 'YOUR TOKEN';
const sparkClient = new SparkPost(sparkToken);
const pg = require('../../database/pg_connect.js');
const jwt = require('jsonwebtoken');
const validator = require('validator');


function validateEmailAvailable(email, next) {
    pg.connect(function (err, client, done) {
        if (err) return next(err);
        client.query('SELECT checkEmail($1)', [email], function(queryErr, result) {
            if (queryErr) return next(queryErr);
            if (result.rows[0].checkemail === true) {
                return next(null, true);
            }
            return next(null, false);
        });
    });
}

function validateUsernameAvailable(username, next) {
    pg.connect(function (err, client, done) {
        if (err) return next(err);
        client.query('SELECT checkUsername($1)', [username], function(queryErr, result) {
            if (queryErr) return next(queryErr);
            if (result.rows[0].checkusername === true) {
                return next(null, true);
            }
            return next(null, false);
        });
    });
}

function createUser(user, next) {
    console.log('ARE YOU REAL');
    pg.connect(function (err, client, done) {
        if (err) return next(err);
        client.query('SELECT * FROM createuser_v3($1::varchar, $2::varchar)', user, function (pgerr, result) {
            done();
            console.log('HELL?');
            // todo: handle varchar length error
            if (pgerr) {
                return next(err);
            }
            console.log(result.rows[0]);
            let userID = result.rows[0].userid;
            return next(null, userID);
        });
    });
}

function createLogin(username, password, userID, email, next) {
    pg.connect(function (err, client, done) {
        if (err) return next(err);
        client.query('INSERT INTO logins(userName, password, userID, email) VALUES ($1, $2, $3, $4) returning loginID', [username, password, userID, email], function (clientErr, result) {
            done();
            if (clientErr) return next(err);
            return next(null, true);
        });
    });
}

module.exports = function(req, res, next) {

    const user = req.body.user;
    const loginData = req.body.loginData;

    let userData = [
        user.firstName,
        user.lastName
    ];

    validateEmailAvailable(user.email, function(err, notAvail) {
        if (err) {
            console.log("Username Avail Error: " + err);
            return next(err);
        }
        if (notAvail)  {
            return res.status(401).send({message: 'This email is already in use.'})
        } else if (!validator.isEmail(user.email)) {
            return res.status(401).send({message: 'That is not a valid email address'});
        }
        validateUsernameAvailable(loginData.username, function(err, notAvail) {
            if (err) {
                console.log('Username Avail Error: ' + err);
                return next(err);
            }
            if (notAvail) return res.status(401).send({message: 'This username is already in use.'});
            createUser(userData, function (err, userID) {
                if (err) return next(err);
                createLogin(loginData.username, loginData.password, userID, user.email, function(loginCreationErr, userCreated) {
                    if (loginCreationErr) {
                        return next(loginCreationErr);
                    }
                    const token = jwt.sign({ userID: userID }, 'temptoken');

                    // End Elastic
                    var reqObj = {
                        transmissionBody: {
                            campaignId: 'registration-confirmation',
                            content: {
                                from: 'donotreply@email.kinkytalent.com',
                                subject: 'Please Validate',
                                html: '<html><body>Please verify your email address by clicking the link. <p>http://localhost:3000/api/register/confirm/{{token}}</p></body></html>',
                                text: 'Please verify your email address by clicking the link. http://localhost:3000/api/register/confirm/{{token}}'
                            },
                            substitutionData: {name: user.firstName, token: token},
                            recipients: [{ address: { name: user.firstName + ' ' + user.lastName, email: user.email } }]
                        }
                    };

                    sparkClient.transmissions.send(reqObj, function(sparkErr, res) {
                        if (sparkErr) {
                            console.log('Whoops! Something went wrong');
                            console.log(err);
                        } else {
                            console.log('Woohoo! You just sent your first mailing!');
                        }
                    });
                    res.json(userCreated);
                });
            });
        });
    });
};
