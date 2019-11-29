const express=require("express");
const router=express.Router();
const fs=require('fs');
const d3=require('d3');

const forceNode=require('../models/forceNode');
const Link=require('../models/Link');
const fun=require('../config/fun');

//向数据库中插入力导向布局后点的坐标（会清空之前的布局数据）
router.get('/forceLayout/:id',(req,res)=>{
    Alledges = [];
    Allnodes = [];
    fs.readFile(`./public/${req.params.id}/originalLinkData/links.csv`, function (err, data) {
        // var table = new Array();
        if (err) {
            console.log(err);
            return;
        }
    
        fun.ConvertToTable(data, function (table) {
            for(var i=0;i<table.length;i++){
                if(table[i][0]!=''&&table[i][1]!=''){
                    Alledges.push(table[i]);
                    if(Allnodes.indexOf(table[i][0])<0){
                        Allnodes.push(table[i][0]);
                    };
                    if(Allnodes.indexOf(table[i][1])<0){
                        Allnodes.push(table[i][1]);
                    };
                }
            }
            drawforce(Allnodes,Alledges,res,req.params.id);
        })
    })
});

//查询所有的点数据
router.post('/findAll',(req,res)=>{
    let width=req.body.width;
    let height=req.body.height;
    let file=req.body.file;
    let padding={
        left:10,
        right:10,
        top:10,
        bottom:10
    };
    forceNode.find({file:file})
    .then((nodes)=>{
        //将x,y根据width,height做比例映射
        let dic={};
        let x_max=d3.max(nodes,d=>d.x);
        let x_min=d3.min(nodes,d=>d.x);
        let y_max=d3.max(nodes,d=>d.y);
        let y_min=d3.min(nodes,d=>d.y);
        //让取值范围大于1然后取对数
        // let xmin=Math.log10(x_min+Math.abs(x_min)+1);
        // let xmax=Math.log10(x_max+Math.abs(x_min)+1);
        // let ymin=Math.log10(y_min+Math.abs(y_min)+1);
        // let ymax=Math.log10(y_max+Math.abs(y_min)+1);
        let x_scale=d3.scaleLinear().domain([x_min,x_max]).range([padding.left,width-padding.right]);
        let y_scale=d3.scaleLinear().domain([y_min,y_max]).range([padding.top,height-padding.bottom]);
        for(let i=0;i<nodes.length;i++){
            let x=x_scale(nodes[i].x);
            let y=y_scale(nodes[i].y);
            dic[nodes[i].name]={x:x,y:y};
        };
        return res.send(dic);
        
    })
    .catch((err)=>{
        return res.send({data:"查询失败"})
    });
})

//查询所有点的数量
router.post('/findNodeCount',(req,res)=>{
    let file=req.body.file;
    forceNode.countDocuments({file:file})
    .then((count)=>{
        return res.send({data:count});
    })
    .catch((err)=>{
        console.log(err);
        return res.send({data:"查询失败"})
    });
})

//力导向布局函数
function drawforce(nodeArr, edgeArr,res,file) {
    var nodesid = [];
    for (var i = 0; i < nodeArr.length; i++) {
        nodesid.push({
            id: parseInt(nodeArr[i])
        })
    }
    var links = []

    for (var i = 0; i < edgeArr.length; i++) {
        links.push({
            source: parseInt(edgeArr[i][0]),
            target: parseInt(edgeArr[i][1])
        })
    }

    const width = 600;
    const height = 800;
    
    var simulation = d3.forceSimulation(nodesid)
        .force("link", d3.forceLink(links).distance(100).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on('tick', function () {
            // console.log("waiting...");
        })
        .on("end",()=>{
            console.log("布局完成！");
            //删除之前的布局
            forceNode.remove({},(err)=>{
                if(err){
                    console.log("err:",err);
                }
            })
            // console.log(nodesid)
            for(let i=0;i<nodesid.length;i++){
                
                    let newForceNode=new forceNode({
                        name:nodesid[i].id,
                        x:nodesid[i].x,
                        y:nodesid[i].y,
                        file:file,
                    });
                    newForceNode.save();
                
            }
            console.log("存储完成");
            res.send("力布局完成，数据插入完成！");
            
        })
    
};


module.exports=router;