const User = require('../models/User');
const Profile = require('../models/Profile');
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcryptjs');
const {mailSender} = require("../utils/mailSender")
const jwt = require('jsonwebtoken');
const {passwordUpdated} = require("../mail/templates/passwordUpdate")
require('dotenv').config();

exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user already exists
        const checkUserPresent = await User.findOne({ email });
        if (checkUserPresent) {
            return res.status(400).json({
                success: false,
                message: "User already Exists",
            });
        }

        // Generate OTP
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        console.log("OTP is:", otp);

        // Ensure OTP is unique
        let result = await OTP.findOne({ otp });
        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({ otp });
        }

        // Create OTP entry in database
        const otpPayload = { email, otp };
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        // Send response with OTP sent status
        return res.status(200).json({
            success: true,
            message: "OTP sent successfully!!!",
            otp
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "OTP could not be generated",
        });
    }
};


//signup

exports.signUp = async (req,res) => {
    try {
        const {firstName,lastName,email,password,confirmPassword,accountType,contactNumber,otp} = req.body;
        //validate data
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:"All Fields are required",
            });
        }
        //dono password match karo
        if(password!==confirmPassword){
           return res.status(400).json({
                success:false,
                message:"Passwords are not match",
            });
        }

        //email exist or not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User is already registered",
            });
        }

        //find most recent OTP
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1)
        console.log('Recent Otp is : ',recentOtp);
        console.log(`Received OTP: ${otp}, Stored OTP: ${recentOtp[0].otp}`);


        //check the otp is valid or not
        if(recentOtp.length==0){
            return res.status(400).json({
                success:false,
                message:"OTP not found",
            })
        } else if(otp.toString()!==recentOtp[0].otp.toString()){
            return res.status(400).json({
                success:false,
                message:"OTP not match",
            })
        }

        //hash password
        const hashPassword = await bcrypt.hash(password,10);

        //create entry in db
        const ProfileDetails = await Profile.create({gender:null,dateOfBirth:null,about:null,contactNumber:null});


        const user = await User.create({
            firstName,lastName,email,contactNumber,
            password:hashPassword,
            accountType,
            additionalDetails:ProfileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });
        return res.status(200).json({
            success: true,
            user,
            message: "User registered successfully",
          })
        } catch (error) {
          console.error(error)
          return res.status(500).json({
            success: false,
            message: "User cannot be registered. Please try again.",
          })
        }
    }
//login
exports.login = async(req,res) => {
    try {
        //fetch data
        const {email,password} = req.body;
        //
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:'Please enter full details'
            });
        }

        //find user
        const user = await User.findOne({email}).populate('additionalDetails');
        if(!user){
            return res.status(400).json({
                success:false,
                message:'User is not regiser , Please SignUp',
            })
        };

        if(await bcrypt.compare(password,user.password)){
            //make the token
            const token = jwt.sign(
                { email: user.email, id: user._id, role: user.role },
                process.env.JWT_SECRET_KEY,
                {
                    expiresIn:'24h',
                }
            );
            //saved the entry in db
            user.token = token;
            user.password = undefined;
            //send the cookie
            const option = {
               expires:  new Date(Date.now() + 3*24*60*60*1000),
               httpOnly :true,
            }
            res.cookie("token",token,option).status(200).json({
                token : token,
                user : user,
                success:true,
                message:'User login successfully!!',
            });
        }
        else{
            return res.status(400).json({
                success: false,
                message: `Password is incorrect`,
            })
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Login failure , Please try again',
        })
    }
}


//change password 
exports.changePassword = async (req,res) => {
    try {
        //get user data 
        const userDetails = await User.findById(req.user.id);
        //get old password and new password
        const {oldPassword,newPassword} = req.bodyl
        //validata old password
        const isPasswordMatch = await bcrypt.compare(oldPassword,userDetails.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                success:false,
                message:'Please enter the correct password',
            })
        };
        //update old password by bcyrpt
        const encryptedPassword = await bcrypt.hash(newPassword,10);
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            {password:encryptedPassword},
            {new:true},
        );
        //send mail notification
        try {
            const emailResponse = await mailSender(
                updatedUserDetails.password,"Password for your account is updated",
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                  )
            );
            console.log("Email sent successfully:", emailResponse.response)
        } catch (error) {
            console.error("Error occurred while sending email:", error)
            return res.status(500).json({
              success: false,
              message: "Error occurred while sending email",
              error: error.message,
            })
          }
          return res.status(200).json({
            success:true,
            message:"Password has been updated",
          })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Change Password failure , Please try again',
        })
    }
}



