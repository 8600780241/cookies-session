const mongoose = require("mongoose");
const userschema = new mongoose.Schema({
    username:{
        type:String,
    },
    email:{
        type:String,
    },
    simplepassword:{
        type:String,
    },
    hashpassword:{
        type:String,
    },
});
const usermodel = mongoose.model("users",userschema);
module.exports = usermodel;