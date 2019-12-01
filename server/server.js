const express = require("express");
const app = express();
const mongoose = require('mongoose');
const bodyParser = require("body-parser");

//连接mongodb数据库
mongoose.Promise=global.Promise;
mongoose.connect('mongodb://localhost/second',{useNewUrlParser:true, useUnifiedTopology: true })
        .then(()=>console.log('connect database successful!'))
        .catch((err)=>console.log(err));

//加载bodyPaser中间件
app.use(bodyParser.urlencoded({extended:false,limit:'10000kb'}));
app.use(bodyParser.json({limit:'10000kb'}));

//设置允许跨域
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Credentials", true)
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", " Origin, X-Requested-With, Content-Type, Accept")
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8")
    next()
    });

//配置路由
const LinkRouter=require('./routes/links');
const ForceRouter=require('./routes/forceNodes');
const TsneRouter=require('./routes/tsneNodes');
const TreeRouter=require('./routes/tree');
const ClassLinkRouter=require('./routes/classLinks')
app.use('/link',LinkRouter);
app.use('/force',ForceRouter);
app.use('/tsne',TsneRouter);
app.use('/tree',TreeRouter);
app.use('/classLink',ClassLinkRouter);

app.use('/',(req,res)=>{
    res.writeHead(200,{'Content-Type':'text/html;charset=UTF8'});
    res.write('<a href="http://localhost:5000/link/insertLinks/zhuanli">插入专利连接数据</a><br/>');
    res.write('<a href="http://localhost:5000/tsne/insertTsneNodes/zhuanli">插入专利tsne数据</a><br/>');
    // res.write('<a href="http://localhost:5000/classLink/insertClassLinks/zhuanli">插入专利类连接数据</a><br/>');
    res.write('<a href="http://localhost:5000/force/forceLayout/zhuanli">插入专利原始布局点坐标数据</a><br/><br/><br/>')

    res.write('<a href="http://localhost:5000/link/insertLinks/weibo">插入微博连接数据</a><br/>');
    res.write('<a href="http://localhost:5000/tsne/insertTsneNodes/weibo">插入微博tsne数据</a><br/>');
    // res.write('<a href="http://localhost:5000/classLink/insertClassLinks/weibo">插入微博类连接数据</a><br/>');
    res.write('<a href="http://localhost:5000/force/forceLayout/weibo">插入微博原始布局点坐标数据</a><br/><br/><br/>')
    res.end();
})

const port=process.env.PORT || 5000;
app.listen(port,()=>{
    console.log(`Server running on port ${port}!`);
})

