const mongoose =require("mongoose");
const Schema=mongoose.Schema;

//Create Scahema
const classLinkSchema=new Schema({
    source:{
        type:String,
        required:true
    },
    target:{
        type:String,
        required:true
    },
    value:{
        type:Number,
        required:true,
    },
    label:{
        type:String,
        required:true,
    },
    type:{
        type:String,
        required:true,
    }
})

module.exports=classLink=mongoose.model("classLinks",classLinkSchema);