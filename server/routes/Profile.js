const express = require('express');
const router = express.Router();

const {updateProfile,deleteAccount, updateProfilePicture, getAllUserDetails} = require('../controllers/Profile');
const { auth } = require('../middleware/auth');

router.put('/updateProfile',auth,updateProfile)
router.put('/updateProfilePicture',auth,updateProfilePicture);
router.get('/getUserDetails',auth,getAllUserDetails);
router.delete('/deleteProfile',auth,deleteAccount);

module.exports = router;