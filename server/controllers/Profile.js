const Profile = require('../models/Profile');
const User = require('../models/User');

exports.updateProfile = async (req,res) => {
    try {
        //fetch the user id , get data
        const {dateOfBirth="",about="",contactNumber,gender} = req.body;
        const userId = req.user.id;
        //validate
        if(!contactNumber || !gender){
            return res.status(404).json({
                success:false,
                message:'Fieldsa are required',
            })
        }
        //find profile
        const userDetails = await User.findById(userId);

        //fetch the profile id from the user details
        const profileId = userDetails.additionalDetails;

        //get the profile id
        const profieDetails = await Profile.findById(profileId);

        //update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profieDetails.about = about;
        profieDetails.contactNumber = contactNumber;
        profieDetails.gender = gender;
        //save in db
        await profileDetails.save();
        //return response
        return res.status(200).json({
           success:true,
           message:'Profile updated successfully!!!',
        })
        
    } catch (error) {
        res.status(500).json({
			success: false,
			message: "Unable to update profile, please try again later",
			error: error.message,
		});
    }
}

exports.deleteProfile = async (req,res) => {
    try {
        //fetch the user id
        const id = req.user.id;
        const userDetails = await User.findById(id);
        //validate 
        if(!userDetails){
            return res.status(404).json({
                success: false,
                message: "User not found",
              })
        }
        //profile delete 
        await Profile.findByIdAndDelete({id:userDetails.additionalDetails});

        //TODO :  HOMEWORK ->Unenrolled user from enrolled course

        //user delete
        await User.findByIdAndDelete({id:id});
        
        //return response
        res.status(200).json({
            success: true,
            message: "User deleted successfully",
          })
    } catch (error) {
        res.status(500).json({
			success: false,
			message: "Unable to delete account, please try again later",
			error: error.message,
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

        return res.status(200).json({
            success:true,
            message:'Get all user details successfully',
        });

    } catch (error) {
        res.status(500).json({
			success: false,
			message: "Not found",
			error: error.message,
		});
    }
}