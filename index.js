const express = require('express');
const body_parser = require('body-parser');
const chalk = require('chalk');
const cors = require('cors');
const http = require('http');
const port = process.env.PORT || 3000;

// Modules
const auth = require('./api/auth/auth.routes');
const register = require('./api/register/register.routes');

// App
const app = express();

app.use(cors());
app.use(body_parser.json());
app.set('showStackError', true);
app.disable('x-powered-by');

app.use('/api', auth);
app.use('/api', register);

app.get('/heart', function(req, res) {
    res.status(200).send({'message':'Node api is online!'});
});

// TODO: Implement error logging.
app.use(function(err, req, res, next) {
    console.log('status: ' + err.status);
    if(err.status !==  404) {
        res.status(500).send();
    } else {
        res.status(404);
        res.send(err.message || 'URL or Page not found.');
    }
});


const server = app.listen(port, function() {
    const host = server.address().address;
    const port = server.address().port;
    console.log('Node Api is running at http://%s:%s', host, port);
});

console.log('--');
exports.app = app;
