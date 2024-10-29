const SubSection = require('../models/SubSection');
const Section = require('../models/Section');
const { uploadImageToCloudinary } = require('../utils/imageUploader');
require('dotenv').config();

exports.createSubSection = async (req,res) => {
    try {
        //fetchig the data 
        const {sectionId,title,timeDuration,description} = req.body;
        //extract files
        const video = req.files.videoFile;
        //validate
        if (!sectionId || !title || !timeDuration ||!description || !video) {
            return res
              .status(404)
              .json({ success: false, message: "All Fields are Required" })
          }
          console.log(video)
        //upload to cloudinary 
        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME,)
        //fetch the secure url
        //create a subsection
        const SubSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            descriptipn:description,
            videoUrl:uploadDetails.secure_url,
        })
        //update secion with this subsection object id
        const updatedSection = await Section.findByIdAndUpdate(
            {_id:sectionId},{
                $push:{
                    subSection:SubSectionDetails._id,
                },
            },{new:true},
        ).populate('subSection');

        return res.status(200).json({
             success:true,
             message:'Sub Section created successfully!!',
             updatedSection
        })
    } catch (error) {
        res.status(500).json({
			success: false,
			message: "Unable to create Subsection , please try again later",
			error: error.message,
		});
    }
}

exports.updateSubSection = async (req,res) => {
    try {
        //fetch the data
        const {sectionId,subSectionId,title,description} = req.body;
        //fetch the sub section
        const subSection = await SubSection.findById(subSectionId);
        //validate
        if (!subSection) {
            return res.status(404).json({
              success: false,
              message: "SubSection not found",
            })
          }
        if(!title || !description){
            return res.status(404).json({
                success: false,
                message: "All fields are required",
              })
        }
        subSection.title = title;
        subSection.descriptipn = description;
        if(req.files && req.files.videoFile!==undefined){
            const video = req.files.videoFile;
            const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
            subSection.videoUrl = uploadDetails.secure_url;
            subSection.timeDuration = `${uploadDetails.duration}`;
        }
        await subSection.save();
        //find updated section by id
        const updatedSection = await Section.findById(sectionId).populate(
            "subSection"
          );
          console.log(updatedSection);
          return res.json({
            success: true,
            message: "Section updated successfully",
            data: updatedSection,
          })
        
    } catch (error) {
        res.status(500).json({
			success: false,
			message: "Unable to update Subsection , please try again later",
			error: error.message,
		});
    }
}

exports.deleteSubSection = async (req,res) => {
    try {
        const {subSectionId,sectionId} = req.body;
        //delete in section
        await Section.findByIdAndDelete(
            {_id:sectionId}, 
            {
                $pull:{
                    subSection:subSectionId,
                }
            },{new:true},
        );
        //delete in sub section
        const subSection = await SubSection.findByIdAndDelete({_id:subSectionId});
        if(!subSection){
            return res
            .status(404)
            .json({ success: false, message: "SubSection not found" })
        }

          // find updated section and return it
        const updatedSection = await Section.findById(sectionId).populate(
        "subSection"
        );
        return res.json({
            success: true,
            message: "SubSection deleted successfully",
            data: updatedSection,
          })
        
    } catch (error) {
        res.status(500).json({
			success: false,
			message: "Unable to deletd Subsection , please try again later",
			error: error.message,
		});
    }
}