const express = require('express');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const cors = require('cors');
const port = process.env.PORT || 3000;

// Modules
const auth = require('./api/auth/auth.routes');
const register = require('./api/register/register.routes');

// App
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.set('showStackError', true);

// Security setting
app.disable('x-powered-by');

// Wire up express route files
app.use('/api', auth);
app.use('/api', register);

// Heartbeat url.
app.get('/heart', function (req, res) {
    res.status(200).send('Node api is online!');
});

// Todo: configure errhandler route
app.use(function(err, req, res, next) {
    if (!err) return next();
    res.status(500).send({error : err.stack});
});

app.use(function(req, res) {
    res.status(404).send({ url : req.originalUrl, error : 'Not Found.' });
});

const server = app.listen(port, function() {
    const host = server.address().address;
    const port = server.address().port;
    console.log('Node Api is running at http://%s:%s', host, port);
});

console.log('--');