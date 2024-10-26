const express = require('express');
const { capturePayment, verifySignature } = require('../controllers/Payment');
const {auth,isStudent} = require('../middleware/auth');
const router = express.Router();

router.post('/capturePayment',auth,isStudent,capturePayment);
router.post('/verifyPayment',verifySignature);


module.exports = router;
