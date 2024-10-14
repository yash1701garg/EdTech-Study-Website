const nodemailer = require('nodemailer');
require('dotenv').config();

exports.mailSender = async (email,title,body) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASSWORD,
            }
        });

        let info = transporter.sendMail({
            from:'STUDY notion || Yash Garg',
            to : `${email}`,
            subject:`${title}`,
            html:`<h1>${body}</h1>`,
        });
        console.log(info);
        return info;
        
    } catch (error) {
        console.error(error);
        
    }
}