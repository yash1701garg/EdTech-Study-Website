const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const { courseEnrollmentEmail } = require('../mail/templates/courseEnrollmentEmail');
const { default: mongoose } = require('mongoose');

exports.capturePayment = async (req, res) => {
    //get courseId and userId
    const { courseId } = req.body;
    const userId = req.user.id;
    //validate
    //valid courseId
    if (!courseId) {
        return res.json({
            success: false,
            message: 'Please provide valid course ID',
        })
    };
    //valid courseDetail
    let course;
    try {
        course = await Course.findById(course_id);
        if (!course) {
            return res.json({
                success: false,
                message: "Could not find the Course"
            });
        }
        //user already pay for same course 
        const uid = new mongoose.Types.ObjectId(userId);
        if (course.studentEnrolled.includes(uid)) {
            return res
                .status(200)
                .json({ success: false, message: "Student is already Enrolled" });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }

    //create order
    const amount = course.price;
    const options = {
        amount: amount * 100,
        currency: 'INR',
        reciept: Math.random(Date.now()),
        notes: {
            courseId: courseId,
            userId,
        }
    };
    try {
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);
        return res.status(200).json({
            success: true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Could not initiate order."
        });
    }
    //return res
};

//verify the signature and server
exports.verifySignature = async (req, res) => {
    const webhookSecret = "12345678";
    const signature = req.headers("x-razorpay-signature");
    const shasum = crypto.createHmac(
        "sha256",
        webhookSecret
    );
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");
    if (digest === signature) {
        console.log('Payment is authorized');
        const { courseId, userId } = req.body.payload.payment.entity.notes;
        try {
            //find the course and enrolled the student in it
            const enrolledCourse = await Course.findByIdAndUpdate(
                { _id: courseId },
                {
                    $push: {
                        enrolledCourse: userId,
                    }
                },
                { new: true },
            );
            if (!enrolledCourse) {
                return res.status(400).json({
                    success: false,
                    message: 'Course not found',
                })
            }
            console.log(enrolledCourse);

            //find the student and add course in the list of enrolled course
            const enrolledStudent = await User.findByIdAndUpdate(
                { _id: userId },
                {
                    $push: {
                        courses: courseId,
                    }
                },
                { new: true },
            );
            console.log(enrolledStudent);

            //send the confirmation mail
            const emailResponse = await mailSender(
                enrolledStudent.email,
                "Congratulations, you are onboarded into new CodeHelp Course",
                "Congratulations, you are onboarded into new CodeHelp course",
            );
            console.log(emailResponse);
            return res.status(200).json
                ({
                    success: false,
                    message: "Signature Verified and Course Added", 
                })
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, error: error.message })
        }
    }
    else {
        return res.status(400).json({
            success: false,
            message: 'Invalid request',
        });
    }
};