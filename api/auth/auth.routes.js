const express = require('express');
const router = express.Router();

const login = require('./auth.login');
const validate = require('./auth.validate');

router.post('/auth', login);

//router.put('/auth', forgot);
//router.post('/auth/logout', logout);

module.exports = router;