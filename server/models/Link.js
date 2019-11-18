const mongoose =require("mongoose");
const Schema=mongoose.Schema;

//Create Scahema
const LinkSchema=new Schema({
    source:{
        type:String,
        required:true
    },
    target:{
        type:String,
        required:true
    },
})

module.exports=Link=mongoose.model("links",LinkSchema);