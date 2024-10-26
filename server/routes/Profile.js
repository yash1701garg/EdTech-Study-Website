const express = require('express');
const router = express.Router();

const {updateProfile,deleteAccount} = require('../controllers/Profile');

router.post('/updateProfile',updateProfile)

module.exports = router;