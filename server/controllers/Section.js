const Section = require('../models/Section');
const Course = require('../models/Course');
const SubSection = require('../models/Section')

exports.createSection = async (req,res) => {
    try {
        //data fetch
        const {sectionName,courseId} = req.body;
        //validate
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            })
        }
        //create section
        const newSection = await Section.create({sectionName});
        //update in course schema 
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent:newSection._id,
                }
            },{new:true},
        ).populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        }) //use populate to replace section and subsection both in the updated course details
        .exec();
        return res.status(200).json({
            success:true,
            message:'Section created successfully!!!',
            updatedCourse,
        });
    } catch (error) {
        res.status(500).json({
			success: false,
			message: "Unable to create section , please try again later",
			error: error.message,
		});
    }
}

exports.updateSection = async (req,res) => {
    try {
        //fetch data
        const {sectionName,sectionId} = req.body;
        //validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            })
        }
        //update in the section - no need to change in course because course contain section id 
        const section = await Section.findByIdAndUpdate(sectionId,
            {sectionName:sectionName},{new:true},
        )
       
        return res.status(200).json({
            success:true,
            message:'Section updated successfully!!!',
        })
    } catch (error) {
        res.status(500).json({
			success: false,
			message: "Unable to update section , please try again later",
			error: error.message,
		});
    }
}

exports.deleteSection = async (req, res) => {
	try {

		const { sectionId, courseId }  = req.body;
		await Course.findByIdAndUpdate(courseId, {
			$pull: {
				courseContent: sectionId,
			}
		})
		const section = await Section.findById(sectionId);
		console.log(sectionId, courseId);
		if(!section) {
			return res.status(404).json({
				success:false,
				message:"Section not Found",
			})
		}

		//delete sub section
		await SubSection.deleteMany({_id: {$in: section.subSection}});

		await Section.findByIdAndDelete(sectionId);

		//find the updated course and return 
		const course = await Course.findById(courseId).populate({
			path:"courseContent",
			populate: {
				path: "subSection"
			}
		})
		.exec();

		res.status(200).json({
			success:true,
			message:"Section deleted",
			data:course
		});
	} catch (error) {
		console.error("Error deleting section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};