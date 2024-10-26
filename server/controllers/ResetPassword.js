const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const bcrypt = require('bcrypt');

//reset password token
exports.resetPasswordToken = async (req,res) => {
    try {
        //get email
    const {email} = req.body;
    //email validation
    const user = await User.findOne({email});
    if(!user){
        res.json({
            success:false,
            message:`This Email: ${email} is not Registered with Us Enter a valid Email`,
        });
    }
    //token generate
    const token = crypto.randombytes(20).toString("hex");
    //update user by adding token and expiring time
    const updateDetails = await User.findOneAndUpdate({email:email},
        {token:token,
        resetPasswordExpires: Date.now() + 3600000},
        {new:true}
    );
    console.log("DETAILS",updateDetails);
    //create url
    const url = `http://localhost:3000/update-password/${token}`;
    //send mail
    await mailSender(
        email,
        'Password reset link',
        `Your Link for email verification is ${url}. Please click this url to reset your password.`
    );

    return res.send(200).json({
        success:true,
        message:"Email sent successfully, Please Check Your Email to Continue Further"
    });
    } catch (error) {
        return res.json({
            error: error.message,
            success:false,
            message:"Something went wrong while reset Message",
        });
    }
};

//reset password
exports.resetPassword = async (req,res) => {
     try {
        //data fetch
        const {password,confirmPassword,token} = req.body;
        //validation
        if(confirmPassword !== Password){
            return res.json({
                success:false,
                message:"Password is not matching",
            });
        }
        //token -> isko mai apne users ko find karne ke liye karunga taaki user mai password update kar sku
        const userDetails = await User.findOne({token:token});
        //if not entry - invalid token
        if(!userDetails){
            res.json({
                success:false,
                message:"Invalid token",
            });
        }
        //token time check
        if(!(userDetails.resetPasswordExpires > Date.now())){
            res.json({
                success:false,
                message:"Token expired please again reset password",
            });
        }
        const encryptedPassword = await bcrypt.hash(password, 10);
        await User.findOneAndUpdate(
            {token:token},
            {password:encryptedPassword},
            {new:true}
        );
        res.json({
            success:true,
            message:"Password reset successfully!!!",
        });
     } catch (error) {
        return res.json({
            error: error.message,
            success:false,
            message:"Error in reset password",
        });
     }
};
