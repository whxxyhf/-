const express=require("express");
const router=express.Router();
const fs=require('fs')

//查找整棵树
router.post('/findTree',(req,res)=>{
    let label=req.body.label;
    let type=req.body.type;
    let fileName='./public/data/treeData/'+label+"_130.5_"+type+'_t.json';
    fs.readFile(fileName,(err,data)=>{
        
        if(err) console.log(err)
        data=JSON.parse(data);
        res.send(data);
    })
});

module.exports=router;