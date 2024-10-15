const User = require('../models/User');
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator');
//send otp
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
        
    } catch (error) {
        
    }
}

//login


//change password 



