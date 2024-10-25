const express = require('express');
const router = express.Router();

const {updateProfile,deleteProfile} = require('../controllers/Profile');

router.post('/updateProfile',updateProfile)
router.post('/deleteProfile',deleteProfile);


module.exports = router;