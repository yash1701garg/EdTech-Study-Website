const mongoose = require('mongoose');
require('dotenv').config();
const URL = process.env.MONGO_DB_URL;
exports.dbConnect = () => {
    try {
        mongoose.connect(URL);
        console.log('datebase connection successfully!!!');
    } catch (error) {
        console.error('database connection error',error);   
    }
};