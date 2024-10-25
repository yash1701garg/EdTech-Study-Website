const express = require('express');
const router = express.Router();

const {login,signUp,sendOTP,changePassword} = require('../controllers/Auth');
const {auth} = require('../middleware/auth');
const {resetPasswordToken,resetPassword} = require('../controllers/ResetPassword');

router.post('/login',login);
router.post('/signup',signUp);
router.post('/sendotp',sendOTP);
router.post('/changePassword',auth,changePassword);

router.post('/reset-password-token',resetPasswordToken);
router.post('/reset-password',resetPassword);

module.exports = router;
