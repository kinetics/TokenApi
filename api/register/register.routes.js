const express = require('express');
const router = express.Router();
const register = require('./register.create');
const confirm = require('./register.confirm');

router.post('/register', register);
router.get('/register/confirm/:token', confirm);

module.exports = router;