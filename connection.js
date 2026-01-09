const mongoose = require('mongoose');

const connectDb= (url)=>{
     mongoose.connect(url).then(()=>{
        console.log("Connected to the database successfully");
    }).catch((err)=>{
        console.log("Database connection failed", err);
    });
}
module.exports= connectDb;
