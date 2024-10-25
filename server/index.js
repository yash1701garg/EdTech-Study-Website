const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const { dbConnect } = require('./config/database');
require('dotenv').config();
const fileUpload = require('express-fileupload');
const { cloudinaryConnect } = require('./config/cloudinary');
const profileRoutes = require('./routes/Profile');
const paymentRoutes = require('./routes/Payment');
const userRoutes = require('./routes/User');

app.use(express.json());

app.use(cookieParser);

//routes define
app.use("/api/v1/profile",profileRoutes);
app.use("/api/v1/payment",paymentRoutes)
app.use("/api/v1/user",userRoutes);



dbConnect();

//file upload connection
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));
cloudinaryConnect();


const PORT = process.env.PORT || 4000;
app.listen(PORT,()=>{
    console.log(`App is listening at ${PORT}`);
})

app.get('/',(req,res)=>{
    res.send('hello world');
})


