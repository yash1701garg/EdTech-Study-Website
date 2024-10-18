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
        res.send(400).json({
            success:false,
            message:"User not registered!!",
        })
    };
    //token generate
    const token = crypto.randomUUID()
    //update user by adding token and expiring time
    const updateDetails = await User.findOneAndUpdate({email:email},
        {token:token,resetPasswordExpires:Date.now() + 5*60*1000},{new:true});
    //create url
    const url = `http://localhost:3000/update-password/${token}`;
    //send mail
    await mailSender(email,'Password reset link',
        `Password reset link is ${url}`
    );

    return res.send(200).json({
        success:true,
        message:"Email sent successfully"
    })
    } catch (error) {
        console.log(error);
        return res.send(200).json({
            success:false,
            message:"Something went wrong while reset password",
        })
    }
}

//reset password
exports.resetPassword = async (req,res) => {
     try {
        //data fetch
        const {password,confirmPassword,token} = req.body;
        //validation
        if(password!==confirmPassword){
            res.json({
                success:false,
                message:"Password is not matching",
            })
        }
        //token -> isko mai apne users ko find karne ke liye karunga taaki user mai password update kar sku
        const userDetails = await User.findOne({token:token});
        //if not entry - invalid token
        if(!userDetails){
            res.json({
                success:false,
                message:"Invalid token",
            })
        }
        //token time check
        if(userDetails.resetPasswordExpires < Date.now()){
            res.json({
                success:false,
                message:"Token expired please again reset password",
            })
        }
        //hash password
        const hash_password = await bcrypt.hash(password,10);
        //update password on db
        await User.findOneAndUpdate({token:token},{password:hash_password},{new:true});
        res.status(200).json({
            success:true,
            message:"Password reset successfully!!!",
        })
     } catch (error) {
        console.log(error);
        res.status(400).json({
            success:true,
            message:"Error in reset password",
        })
     }
}
