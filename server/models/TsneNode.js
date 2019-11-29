const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const TsneNodeSchema=new Schema({
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
    attr:{
        type:Object
    },
    // conf:{
    //     type:String,
    //     required:true
    // },
    // year:{
    //     type:String,
    //     required:true
    // },
    // times:{
    //     type:String,
    //     required:true
    // },
    label:{
        type:String,
        required:true,
    },
    type:{
        type:String,
        required:true,
    },
    file:{
        type:String,
        required:true,
    }
    
});
module.exports=TsneNode=mongoose.model("tsneNode",TsneNodeSchema,'tsneNode');
