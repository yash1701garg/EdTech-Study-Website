const User = require('../models/User');
const Profile = require('../models/Profile');
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcryptjs');
const {mailSender} = require("../utils/mailSender")
const jwt = require('jsonwebtoken');
const {passwordUpdated} = require("../mail/templates/passwordUpdate")
require('dotenv').config();

//Signup Controller for Registering Users

exports.signup = async (req, res) => {
    try {
        //Destructure fields from the request body
        const{
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        } = req.body;
        // Check if All Details are there or not
        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword ||
            !otp
        ) {
            return res.status(403).send({
                success: false,
                message: "All Fields are required",
            });
        }
        // Check if password and confirm password match
        if (password !== confirmPassword){
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password do not match. please try again.",
            });
        }

        //Check if user already exists
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success: false,
                message: "User already exists. Please sign in to continue.",
            });
        }
        // Find the most recent OTP for the email
        const response = await OTP.find({email}).sort({createdAt: -1}).limit(1);
        console.log(response);
        if (response.length == 0){
            //OTP not found for the email
            return res.status(400).json({
                success: false,
                message: "The OTP is not valid",
            });
        } else if (otp !== response[0].otp){
            //invalid OTP
            return res.status(400).json({
                success: false,
                message: "The OTP is not valid",
            });
        }

        //Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        let approved ="";
        approved == "Instructor" ? (approved = false) : (approved = true);

        // Create the Additional Profile For User
        const ProfileDetails = await Profile.create({
            gender: null,
            dateOfBirth: nill,
            about: null,
            contactNumber: null,
        });
        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType: accountType,
            approved: approved,
            additionalDetails: ProfileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });
        return res.status(200).json({
            success: true,
            user,
            message: "User registered successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "User cannot be registered. Please try again.",
        });
    }
};

// Login controller for authenticating users
exports.login = async (req, res ) =>{
    try {
        //Get email and password from request body
        const {email, password} = req.body;

        //Check if email or password is missing
        if (!email || !password){
            //Return 400 Bad Request status code with error message
            return res.status(400).json({
                success:false,
                message: `Please Fill up all Required Fields`,
            });
        }

        //Find user with provided email
        const user = await User.findOne({email}).populate("additionalDetails");

        //If user not found with provided email
        if(!user){
            //Return 401 Unauthorized status code with error message
            return res.status(401).json({
                success:false,
                
            })
        }
    } catch (error) {
        
    }
}





































































exports.sendOTP = async (req,res) => {
    try {
    const {email} = req.body;

    //check user is exist
    const checkUserPresent = await User.findOne({email});
    if(checkUserPresent){
        return res.status(400).send({
            success:false,
            message:"User already Exists",
        })
    }
    
    var otp = otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
    });
    console.log("OTP is : ",otp);

    //check unique otp 
    var result = await OTP.findOne({otp:otp});

    while(result){
        otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        result = await OTP.findOne({otp:otp});
    }
    const otpPayload = {email,otp};
    
    //create entry in otp
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);
    res.send(200).json({
        success:true,
        message:"OTP sent successfully!!!"
    })
    

    } catch (error) {
        console.log(error);
        res.status(400).json({
            success:false,
            message:"OTP doesnot generated",
        })
    }
}


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
        const recentOtp = await OTP.findOne({email}).sort({createdAt:-1}).limit(1);
        console.log('Recent Otp is : ',recentOtp);

        //check the otp is valid or not
        if(recentOtp.length==0){
            return res.status(400).json({
                success:false,
                message:"OTP not found",
            })
        } else if(otp!==recentOtp){
            return res.status(400).json({
                success:false,
                message:"OTP not match",
            })
        }

        //hash password
        const hashPassword = await bcrypt(password,10);

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
               expires:  new Date(Date.now()) + 3*24*60*60*1000,
               httpOnly:true,
            }
            res.cookie("token",token,option).status(200).json({
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



