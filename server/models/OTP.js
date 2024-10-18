 const mongoose = require('mongoose');
const { mailSender } = require('../utils/mailSender');

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
    },
    otp:{
        type:Number,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60,
    }
});

async function sendVerficationMail(email,otp) {
    try {
        const mailResponse = await mailSender(email,'Verfication mail',otp);
        console.log('Mail response: ',mailResponse);
    
    } catch (error) {
        console.log('error occured while sending mail',error);
    }
};

//send verfication email before saving entry
OTPSchema.pre('save',async function (next) {
    await sendVerficationMail(this.email,this.otp);
    next();
})

module.exports = mongoose.model("OTP",OTPSchema);