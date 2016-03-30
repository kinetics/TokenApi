'use strict';

module.exports = function(req, res, next) {
    let token = req['headers'].token;

    jwt.verify(token, 'tempsecret', function(err, decoded) {
        if (err) return res.status(503);
        req.decoded = decoded;
        next();
    })
};