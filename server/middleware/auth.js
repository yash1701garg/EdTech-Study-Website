const jwt = require("jsonwebtoken");
require('dotenv').config();
const User = require('../models/User');
exports.auth = async (req,res,next) => {
    try {
        //fetch the token
        const token = req.body.token || req.cookies.token || req.header('Authorization').replace('Bearer ',"");
        //validate token
        if(!token){
            return res.status(400).json({
                success:false,
                message:'Token is missing',
            })
        }
        //decode token
        try {
            const decode = jwt.verify(token,process.env.JWT_SECRET_KEY)
            console.log(decode);
            //store the token payload in the request object for furthur use
            req.user = decode;
        } catch (error) {
            return res
				.status(401)
				.json({ success: false, message: "token is invalid" });
        }
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong , while validating token',
        })
    }
};

exports.isStudent = async (req,res,next) => {
    try {
        //fetch the user details 
      const userDetails = await User.findOne({email:req.user.email});
      if(userDetails.accountType!=="Student"){
        return res.status(401).json({
            success: false,
            message: "This is a Protected Route for Students",
        });
      }
       next() ;
    } catch (error) {
        return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
    }
}


exports.isAdmin = async (req,res,next) => {
    try {
        //fetch the user details 
      const userDetails = await User.findOne({email:req.user.email});
      if(userDetails.accountType!=="Admin"){
        return res.status(401).json({
            success: false,
            message: "This is a Protected Route for Admin",
        });
      }
       next() ;
    } catch (error) {
        return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
    }
}

exports.isInstructor = async (req,res,next) => {
    try {
        //fetch the user details 
      const userDetails = await User.findOne({email:req.user.email});
      if(userDetails.accountType!=="Instructor"){
        return res.status(401).json({
            success: false,
            message: "This is a Protected Route for Instructor",
        });
      }
       next() ;
    } catch (error) {
        return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
    }
}