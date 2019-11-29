const express=require("express");
const router=express.Router();
const fs=require('fs')

const Link=require('../models/Link');
const fun=require('../config/fun');

//向数据库中插入网络连接
router.get('/insertLinks/:id',(req,res)=>{
    let file=req.params.id;
    fs.readFile(`./public/${file}/originalLinkData/links.csv`, function (err, data) {
        // var table = new Array();
        if (err) {
            console.log(err);
            return;
        }
    
        fun.ConvertToTable(data, function (table) {
            Link.remove({file:file},(err)=>{
                if(err){
                    console.log("err:",err);
                }
            })
            for(var i=0;i<table.length;i++){
                if(table[i][0]!=''&&table[i][1]!=''){
                    let link=new Link({"source":table[i][0],"target":table[i][1],'file':file});
                    link.save();
                }
            }
            res.send({"data":'数据插入完成！'});
        })
        
    });
});

//查找所有连接
router.post('/findAll',(req,res)=>{
    let file=req.body.file;
    Link.find({file:file})
    .then((links)=>{
        return res.send(links);
    })
    .catch((err)=>{
        return res.send({data:"查询失败"})
    });
})

//查找所有连接数量
router.post('/findCount',(req,res)=>{
    let file=req.body.file;
    Link.countDocuments({file:file})
    .then((count)=>{
        return res.send({data:count});
    })
    .catch((err)=>{
        return res.send({data:"查询失败"})
    });
})

module.exports=router;