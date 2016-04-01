// Dependencies
const express = require('express');
const body_parser = require('body-parser');
const chalk = require('chalk');
const cors = require('cors');
const http = require('http');
const port = process.env.PORT || 3000;
const helmet = require('helmet');

// Modules
const auth = require('./api/auth/auth.routes');
const register = require('./api/register/register.routes');

// App
const app = express();

// Security
app.use(helmet.ieNoOpen());
app.use(helmet.noCache());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.frameguard());
app.use(helmet.xssFilter());
app.use(helmet.hsts({
    maxAge: 123000,
    includeSubdomains: true
}));
app.disable('x-powered-by');
app.use(helmet.noCache());

// configs
app.use(cors());
app.use(body_parser.json());
app.set('showStackError', true);

// Wire up our routesrs.
app.use('/api', auth);
app.use('/api', register);
app.get('/heart', function(req, res) {
    res.status(200).send({'message':'Node api is online!'});
});

// Express error handler and 404.
app.use(function(err, req, res, next) {
    if(err.status !==  404) {
        res.status(500).send('Something went wrong.');
    } else {
        res.status(404);
        res.send(err.message || 'URL or Page not found.');
    }
});

// Create server (would implement https here in production).
const server = app.listen(port, function() {
    const host = server.address().address;
    const port = server.address().port;
    console.log('Node Api is running at http://%s:%s', host, port);
});

console.log('--');

// Export the app for modular testing.
exports.app = app;
