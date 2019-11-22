const express=require("express");
const router=express.Router();
const fs=require('fs');

const ClassLink=require('../models/classLink');

//插入classLink数据
router.get('/insertClassLinks',(req,res)=>{
    let dir='./public/data/classLinkData';
    let filePaths=fs.readdirSync(dir);
    ClassLink.remove({},(err)=>{
        if(err){
            console.log("err:",err);
        }
        else{
            for(let j=0;j<filePaths.length;j++){
                let path=filePaths[j];
                let words=path.split("_");
                let label=words[0];
                let type=words[2];
                let data=JSON.parse(fs.readFileSync(dir+"/"+path)).links;
                for(let k=0;k<data.length;k++){
                    let newClassLink=new ClassLink({
                        'source':data[k].source,
                        'target':data[k].target,
                        'value':data[k].value,
                        'label':label,
                        'type':type,
                    })
                    newClassLink.save();
                }
            }
            res.send({"data":'数据插入完成！'});
        }
    })
    
});
//查找对应label，type的连接
router.post('/findAll',(req,res)=>{
    let label=req.body.label;
    let type=req.body.type;
    ClassLink.find({'label':label,'type':type},{})
    .then((links)=>{
        return res.send(links);
    })
    .catch((err)=>{
        return res.send({data:"查询失败"})
    });
})

//查找类间连接
router.post('/findClassLink',(req,res)=>{
    
    findForceLink(req,edges=>{
        // console.log(edges.length)
        // let newEdges=[];
        // for(let i=0;i<edges.length;i++){
        //     let num=Math.random();
        //     if(num>0.7){
        //         newEdges.push(edges[i]);
        //     }
        // }
        // console.log(newEdges.length)
        return res.send(edges);
    })
})

function findForceLink(req,callback){
    let label=req.body.label;
    let type=req.body.type;
    let classes=req.body.classes;
    let edges=[];
    ClassLink.find({'label':label,'type':type},{'source':1,'target':1,'value':1,'_id':0})
    .then(link=>{
        for(let i=0;i<classes.length-1;i++){
            for(let j=i+1;j<classes.length;j++){
                for(let k=0;k<link.length;k++){
                    if((link[k].source==classes[i].name&&link[k].target==classes[j].name)
                    ||(link[k].source==classes[j].name&&link[k].target==classes[i].name)){
                        edges.push(link[k]);
                    }
                }
            }
        }
        callback(edges);
    })
    .catch((err)=>{
        console.log(err)
        return res.send({data:"查询失败"})
    });
    
}

module.exports=router;