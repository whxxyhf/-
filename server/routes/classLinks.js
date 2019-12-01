const express=require("express");
const router=express.Router();
const fs=require('fs');

const ClassLink=require('../models/classLink');
const Link=require('../models/Link');

//插入classLink数据
router.get('/insertClassLinks/:id',(req,res)=>{
    let file=req.params.id;
    let dir=`./public/${file}/classLinkData`;
    let filePaths=fs.readdirSync(dir);
    ClassLink.remove({file:file},(err)=>{
        if(err){
            console.log("err:",err);
        }
        else{
            let newLinks=[];
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
                        'file':file,
                    })
                    newLinks.push(newClassLink);
                }
            }
            console.log(newLinks.length);
            ClassLink.insertMany(newLinks,(err)=>{
                if(err){
                    console.log(err);
                    res.send("失败");
                }
                else{
                    res.send({"data":'数据插入完成！'});
                }
            });
        }
    })
    
});
//查找对应label，type的连接
router.post('/findAll',(req,res)=>{
    let label=req.body.label;
    let type=req.body.type;
    let file=req.body.file;
    let dir=`./public/${file}/classLinkData`;
    let path=dir+`/${label}_5201.0_${type}_l.json`;
    fs.readFile(path,(err,data)=>{
        if(err){
            console.log(err);
            res.send("err");
        }
        else{
            data=JSON.parse(data).links;
            res.send(data);
        }
    })
    // ClassLink.find({'label':label,'type':type,'file':file},{})
    // .then((links)=>{
    //     return res.send(links);
    // })
    // .catch((err)=>{
    //     return res.send({data:"查询失败"})
    // });
})

//查找类间连接
router.post('/findClassLink',(req,res)=>{
    let label=req.body.label;
    let type=req.body.type;
    let file=req.body.file;
    let classes=req.body.classes;
    let edges=[];
    let names=[];
    let san=[];
    for(let i=0;i<classes.length;i++){
        if(classes[i].ifsan==0){
            names.push(classes[i].name.trim());
        }
        else{
            for(let j=0;j<classes[i].ids.length;j++){
                names.push(String(classes[i].ids[j]));
                san.push(String(classes[i].ids[j]));
            }
        }
    }
    let dir=`./public/${file}/classLinkData`;
    let path=dir+`/${label}_5201.0_${type}_l.json`;
    fs.readFile(path,(err,data)=>{
        if(err){
            console.log(err);
            res.send("err");
        }
        else{
            Link.find({file:file})
            .then((links_o)=>{
                let link=JSON.parse(data).links;
                for(let i=0;i<link.length;i++){
                    if(names.indexOf(link[i].source.trim())>=0&&names.indexOf(link[i].target.trim())>=0){
                        edges.push(link[i]);
                    }
                }
                for(let i=0;i<links_o.length;i++){
                    if(san.indexOf(link[i].source.trim())>=0&&san.indexOf(link[i].target.trim())>=0){
                        links_o[i].value=1;
                        edges.push(links_o[i]);
                    }
                }
                    res.send(edges);
                })
            .catch((err)=>{
                return res.send({data:"查询失败"})
            });
        }
    })
    // findForceLink(req,edges=>{
    //     return res.send(edges);
    // })
})

function findForceLink(req,callback){
    let label=req.body.label;
    let type=req.body.type;
    let file=req.body.file;
    let classes=req.body.classes;
    let edges=[];
    let names=[];
    for(let i=0;i<classes.length;i++){
        if(classes[i].ifsan==0){
            names.push(classes[i].name.trim());
        }
        else{
            for(let j=0;j<classes[i].ids.length;j++){
                names.push(String(classes[i].ids[j]));
            }
        }
    }
    ClassLink.find({'label':label,'type':type,'file':file},{'source':1,'target':1,'value':1,'_id':0})
    .then(link=>{
        for(let i=0;i<link.length;i++){
            if(names.indexOf(link[i].source.trim())>=0&&names.indexOf(link[i].target.trim())>=0){
                edges.push([link[i]]);
            }
        }
        console.log(edges)
        callback(edges);
    })
    .catch((err)=>{
        console.log(err)
        return res.send({data:"查询失败"})
    });
    
}

module.exports=router;