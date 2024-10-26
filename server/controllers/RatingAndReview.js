 const RatingAndReview = require('../models/RatingAndReview');
const Course = require('../models/Course');
const mongoose = require('mongoose');

//create rating 
exports.createRating = async (req,res) => {
    try {
        //fetch the data
        const userId = req.user.id;
        const {courseId,rating,review} = req.body;
        //find the course details
        const courseDetails = await Course.findOne(
                                    {_id:courseId,
                                    studentEnrolled:{$elemMatch:{$eq:userId}} //check the student enrolled id 
                                 });
        //validation
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:'Student not enrolled in course',
            })
        }
        //already reviewed ?
        const alreadReviewed = await RatingAndReview.findOne({
            user:userId,course:courseId,
        });
        if(alreadReviewed){
            return res.status(400).json({
                success:false,
                message:'Already reviewed',
            })
        }

        //create review
        const ratingReview = await RatingAndReview.create({
            user:userId,course:courseId,rating,review
        });

        //update in course
        await Course.findByIdAndUpdate({_id:courseId},
            {
                $push:{
                    ratingAndReviews:ratingReview._id,
                }
            },
            {new:true},
        );

        //return response
        return res.status(200).json({
            success:true,
            message:'Rating and Review created successfully!!!',
            ratingReview,
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
        success:false,
        message: error.message
    }); 
    }
}

//find the average rating 
exports.getAverageRating = async (req,res) => {
    try {
        //get coure id
        const courseId = req.body.courseId;
        //find the average
        const result = await RatingAndReview.aggregate(
            [
                {
                    $match:{
                        course : new mongoose.Types.ObjectId(courseId),
                    },
                },
                {
                    $group:{
                        _id:null,
                        averageRating : {$avg:"$rating"},
                    }
                }
            ]
        );
        //return average rating response
        if(result.length > 0){
            return res.status(200).json({
                success:true,
                averageRating: result[0].averageRating,
            });
        }
        else{
            return res.status(200).json({
               message:"Average rating is 0",
               averageRating:0,
              });
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
        success:false,
        message: error.message,
    }); 
    }
}

//get all rating
exports.getAllRating = async (req,res) => {
    try {
        //get the all data and sorted
        const allReviews = await RatingAndReview.find({})
                           .sort({rating:"desc"}) 
                           .populate(
                            {path:"user",
                              select : "firstName lastName email image" //select only things which needs to show 
                            }
                           ).populate(
                            {path:"course",
                                select: "courseName"
                            }
                           ).exec();
          return res.status(200).json({
            success: true,
            message:"all reviews fetched successfully",
            data:allReviews,
            });
                    
    } catch (error) {
        console.log(error);
        res.status(500).json({
        success:false,
        message: error.message
    }); 
    }
}