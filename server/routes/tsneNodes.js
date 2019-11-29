const express=require("express");
const router=express.Router();
const fs=require('fs');
const d3=require('d3');

const TsneNode=require('../models/TsneNode');
const fun=require('../config/fun');

//插入tsne数据
router.get('/insertTsneNodes/:id',(req,res)=>{
    let dir=`./public/${req.params.id}/tsneData`;
    let filePaths=fs.readdirSync(dir);
    TsneNode.remove({file:req.params.id},(err)=>{
        if(err){
            console.log("err:",err);
        }
        else{
            for(let j=0;j<filePaths.length;j++){
                let path=filePaths[j];
                let words=path.split("_");
                let label=words[0];
                let type=words[2].split('.')[0];
                let data=fs.readFileSync(dir+"/"+path);
                if(req.params.id=='zhuanli'){
                    fun.ConvertToTable(data, function (table) {
                        for(var i=0;i<table.length;i++){
                            if(table[i][0]!=''){//year,country,people,tech,counts
                                let newTsneNode=new TsneNode({"name":table[i][0],
                                attr:{"year":table[i][3],'country':table[i][4],'people':table[i][5],'tech':table[i][6],'counts':table[i][7]},
                                    'x':table[i][1],'y':table[i][2],'label':label,'type':type,'file':req.params.id});
                                newTsneNode.save();
                            }
                        }
                        
                    })       
                }
                
            }
            res.send({"data":'数据插入完成！'});
        }
    })
    
});

//查找所有点
router.post('/findAllLocation',(req,res)=>{
    let label=req.body.label;
    let type=req.body.type;
    let file=req.body.file;
    let width=req.body.width;
    let height=req.body.height;
    let padding={
        left:10,
        right:10,
        top:10,
        bottom:10
    };
    
    TsneNode.find({label:label,type:type,file:file},{name:1,x:1,y:1})
    .then((nodes)=>{
        let newNodes={};
        // 将x,y根据width,height做比例映射
        let x_max=d3.max(nodes,d=>d.x);
        let x_min=d3.min(nodes,d=>d.x);
        let y_max=d3.max(nodes,d=>d.y);
        let y_min=d3.min(nodes,d=>d.y);
        let x_scale=d3.scaleLinear().domain([x_min,x_max]).range([padding.left,width-padding.right]);
        let y_scale=d3.scaleLinear().domain([y_min,y_max]).range([height-padding.bottom,padding.top]);
        for(var i=0;i<nodes.length;i++){
            newNodes[nodes[i].name]={'x':x_scale(nodes[i].x),'y':y_scale(nodes[i].y)};
        }

        return res.send(newNodes);
    })
    .catch((err)=>{
        console.log(err);
        return res.send({data:"查询失败"})
    });
})

router.post('/findAllAttr',(req,res)=>{
    let label=req.body.label;
    let type=req.body.type;
    let file=req.body.file;
    
    TsneNode.find({label:label,type:type,file:file},{name:1,attr:1})
    .then((nodes)=>{
        //  let newNodes={};
        // for(var i=0;i<nodes.length;i++){
        //     newNodes[nodes[i].name]={attr:nodes[i].attr};
        // }

        return res.send(nodes);
    })
    .catch((err)=>{
        console.log(err);
        return res.send({data:"查询失败"})
    });
})

//获取点的数量
router.post('/findCount',(req,res)=>{
    let label=req.body.label;
    let type=req.body.type;
    let file=req.body.file;
    
    TsneNode.countDocuments({label:label,type:type,file:file})
    .then((count)=>{
        //  let newNodes={};
        // for(var i=0;i<nodes.length;i++){
        //     newNodes[nodes[i].name]={attr:nodes[i].attr};
        // }
        return res.send({data:count});
    })
    .catch((err)=>{
        console.log(err);
        return res.send({data:"查询失败"})
    });
})

module.exports=router;