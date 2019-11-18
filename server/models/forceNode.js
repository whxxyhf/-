const mongoose =require("mongoose");
const Schema=mongoose.Schema;

//Create Scahema
const forceNodeSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    x:{
        type:Number,
        required:true
    },
    y:{
        type:Number,
        required:true
    },
})

module.exports=forceNode=mongoose.model("forceNode",forceNodeSchema,"forceNode");