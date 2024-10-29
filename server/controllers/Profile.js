 const Profile = require('../models/Profile');
const User = require('../models/User');
const { uploadImageToCloudinary}= require("../utils/imageUploader");
//method for updating a profile
exports.updateProfile = async (req,res) => {
    try {
        //fetch the user id , get data
        const {dateOfBirth="",about="",contactNumber,gender} = req.body;
        const userId = req.user.id;

        //find profile by id
        const userDetails = await User.findById(userId);
        const profile = await Profile.findById(userDetails.additionalDetails);

        //update profile fields
        profile.dateOfBirth = dateOfBirth;
        profile.about = about;
        profile.contactNumber = contactNumber;
        profile.gender = gender;

        //save the upload profile
        await profile.save();
        //return response
        return res.status(200).json({
           success:true,
           message:'Profile updated successfully!!!',
           profile,
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
			success: false,
			error: error.message,
		});
    }
}

exports.deleteAccount = async (req,res) => {
    try {
        // TODO: Find More on Job Schedule
        // const job = schedule.scheduleJob("10 * * * * *", function (){
        // console.log("This answer to life, the universe, and everything!");
        //});
        //console.log(job;)
        const id = req.user.id;
        const user = await User.findById({_id: id});
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found",
              })
        }
        //delete Assosiated Profile with the User
        await Profile.findByIdAndDelete({_id: user.additionalDetails});

        //TODO :  HOMEWORK ->Unenrolled user from enrolled course

        //user delete
        await User.findByIdAndDelete({_id:id});
        
        //return response
        res.status(200).json({
            success: true,
            message: "User deleted successfully",
          })
    } catch (error) {
        console.log(error);
        res
        .status(500).json({
			success: false,
			message: "Unable to delete account, please try again later",
		});
    }
}

exports.getAllUserDetails = async (req,res) => {
    try {
        //fetch the id
        const id = req.user.id;

        //get user deatils
        const userDetails = await User.findById(id).populate(
            "additionalDetails"
        ).exec();
        console.log(userDetails);
        res.status(200).json({
            success:true,
            message:'Get all user details successfully',
            data:userDetails
        });

    } catch (error) {
        return res.status(500).json({
			success: false,
			message: error.message,
		});
    }
}

//update profile picture controller
exports.updateProfilePicture = async (req,res) => {
   try{
    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )
    console.log(image)
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    )
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}