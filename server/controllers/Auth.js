const User = require('../models/User');
const Profile = require('../models/Profile');
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcryptjs');
const jwt = required("jsonwebtoken");
require("dotenv").config();


//send otp
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        //check user is exist
        const checkUserPresent = await User.findOne({ email });
        if (checkUserPresent) {
            return res.status(400).send({
                success: false,
                message: "User already Exists",
            })
        }

        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        console.log("OTP is : ", otp);

        //check unique otp 
        var result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({ otp: otp });
        }
        const otpPayload = { email, otp };

        //create entry in otp
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);
        res.send(200).json({
            success: true,
            message: "OTP sent successfully!!!"
        })


    } catch (error) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: "OTP doesnot generated",
        })
    }
}


//signup

exports.signUp = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp } = req.body;
        //validate data
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All Fields are required",
            });
        }
        //dono password match karo
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords are not match",
            });
        }

        //email exist or not
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User is already registered",
            });
        }

        //find most recent OTP
        const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);
        console.log('Recent Otp is : ', recentOtp);

        //check the otp is valid or not
        if (recentOtp.length == 0) {
            return res.status(400).json({
                success: false,
                message: "OTP not found",
            })
        } else if (otp !== recentOtp) {
            return res.status(400).json({
                success: false,
                message: "OTP not match",
            })
        }

        //hash password
        const hashPassword = await bcrypt(password, 10);

        //create entry in db
        const ProfileDetails = await Profile.create({ gender: null, dateOfBirth: null, about: null, contactNumber: null });


        const user = await User.create({
            firstName, lastName, email, contactNumber,
            password: hashPassword,
            accountType,
            additionalDetails: ProfileDetails,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });
        return res.status(200).json({
            success: true,
            message: "User registered successfully",
            user,
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
exports.login = async (req, res) => {
    try {
        //get data from req body
        const { email, password } = req.body;
        //validation data
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All fields are required, try again"
            });
        }
        //user check exist or not
        const user = await User.findOne({ email }).populate("additionalDetails");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered, SignUp first",
            });
        }
        //generate JWT after password matching
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h",
            });
            user.token = token;
            user.password = undefined;

            //create cookie and send response
            const options = {
                expires: new Date(Date.now()+ 3*24*60*60*100),
                httpOnly:true,
            }
            res.cookie("token, token, options").status(200).json({
                success:true,
                token,
                user,
                message: "Logged in successfully",
            });  

        }
        
        else{
            return res.status(401).json({
                success: false,
                message: "Password is incorrect",
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message:'Login Failure, please try again',
        });
    }
};

//change password 
exports.changePassword = async (req, res)=>{
    //get data from req body
    //get oldPassword, newPassword, confirmPassword
    //validation

    //update pwd in DB
    //send mail - Password updated
    //return response
}

