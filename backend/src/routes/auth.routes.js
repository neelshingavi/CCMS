const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
// const { validateRegister, validateLogin } = require('../validators/auth.validator');

router.post('/register', authController.register);
router.post('/login', authController.login);
// router.post('/refresh', authController.refresh);

module.exports = router;
