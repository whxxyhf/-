<template>
    <div class="box">
        <svg style="width:100%;height:100%;" ref="svg" id="svg_g">
            
        </svg>
    </div>
</template>

<script>
import {mapGetters} from 'vuex';
import * as d3Force from 'd3-ellipse-force';
// import ForceEdgeBundling from '../../public/js/d3-ForceEdgeBundling';
export default {
    name:"ForceClass",
    data(){
        return {
            circle_Stroke_Width:1,
            circle_Stroke:'white',
            path_Fill:"none",
            path_Stroke:"#ccc",
            path_Stroke_Width_Max:7,//连线宽度最大值
            path_Stroke_Width_Min:.5,//连线宽度最小值
            pt_Length_max:40,//花瓣最长半径
            pt_Length_min:18,//花瓣最短半径
            radius_max:7,//花心最大半径
            radius_min:3,//花心最小半径
            path_Opacity_Max:.7,//连线不透明度最大值
            path_Opacity_Min:.1,//连线不透明度最小值
            pt_Stroke:'white',
            pt_Stroke_Width:1,
            color:["#FF3030","#FF00FF","#C0FF3E","#87CEFA","#FFC0CB"],
            interpolateColor:this.$d3.interpolateBlues,
            colorBarWidth:100,
            colorBarHeight:20,
            addLength:3,//花瓣外环比最长花瓣多出的长度
            pt_Circle_Stroke_Choosed:"red",//花瓣外环选中颜色
            pt_Circle_Stroke_Width:2,
            //饼图的一些属性
            pie_R_Max:30,
            pie_R_Min:10,
            pie_Circle_Stroke:"#ccc",
            pie_Circle_Stroke_Width:2,
            pie_Circle_Stroke_Choosed:'red',
        }
    },
    computed:{
        ...mapGetters(['getClassNames','getLabel','getType','getLastClass','getForceType','getClickClass']),
    },
    methods:{
        //画图
        draw(nodes,links,EdgeBundling){
            // console.log("nodes:",nodes)
            // console.log("links:",links)
            
            let lastClass=[];
            let classDic={};
            for(let i=0;i<this.getClassNames.length;i++){
                lastClass.push(this.getClassNames[i]);
                classDic[this.getClassNames[i].name]=this.getClassNames[i];
            }
            this.$store.dispatch('updateLastClass',lastClass);
            //清除画布
            let svg=this.$d3.select("#svg_g");
            svg.selectAll("g").remove();
            let width=this.$refs.svg.clientWidth;
            //点半径比例尺
            let r_max=this.$d3.max(this.getClassNames,d=>d.num);
            let r_min=this.$d3.min(this.getClassNames,d=>d.num);
            let r_scale=this.$d3.scaleLinear().domain([r_min,r_max]).range([this.radius_min,this.radius_max]);
            //饼图半径比例尺
            let pie_r_scale=this.$d3.scaleLinear().domain([r_min,r_max]).range([this.pie_R_Min,this.pie_R_Max]);
            //点颜色比例尺（映射midu属性）
            let c_max=this.$d3.max(this.getClassNames,d=>d.midu);
            let c_min=this.$d3.min(this.getClassNames,d=>d.midu);
            let c_scale=this.$d3.scaleLinear().domain([c_min,c_max]).range([0,1]);
            //花瓣长度比例尺(映射shang属性)
            let l_max=this.$d3.max(this.getClassNames,d=>{
                return this.$d3.max(d.shang);
            });
            let l_min=this.$d3.min(this.getClassNames,d=>{
                return this.$d3.min(d.shang);
            });
            let l_scale=this.$d3.scaleLinear().domain([l_max,l_min]).range([this.pt_Length_min,this.pt_Length_max]);
            
            //nodes数组转字典
            let nodesDic={};
            for(let i=0;i<nodes.length;i++){
                nodesDic[nodes[i].id]={x:nodes[i].x,y:nodes[i].y};
            }
            //画线
            let link=svg.append("g").attr("class","linkG");
            if(!EdgeBundling){
                let line=this.$d3.line()
                        .x(d=>d[0])
                        .y(d=>d[1])
                //连线宽度比例尺
                let v_max=this.$d3.max(links,d=>d.value);
                let v_min=this.$d3.min(links,d=>d.value);
                let w_scale=this.$d3.scaleLinear().domain([v_min,v_max]).range([this.path_Stroke_Width_Min,this.path_Stroke_Width_Max]);
                //连线不透明度比例尺
                let o_scale=this.$d3.scaleLinear().domain([v_min,v_max]).range([this.path_Opacity_Min,this.path_Opacity_Max]);
                for(let i=0;i<links.length;i++){
                    //起点的x坐标
                    let s_x=nodesDic[links[i].source].x;
                    //起点的y坐标
                    let s_y=nodesDic[links[i].source].y;
                    //终点的x坐标
                    let t_x=nodesDic[links[i].target].x;
                    //终点的y坐标
                    let t_y=nodesDic[links[i].target].y;
                    
                    let point=[[s_x,s_y],[t_x,t_y]];
                    
                    link.append("path")
                        .attr('d',line(point))
                        .attr("fill",this.path_Fill)
                        .attr("stroke-width",w_scale(links[i].value))
                        .attr("stroke-opacity",o_scale(links[i].value))
                        .attr("stroke",this.path_Stroke)
                }
            }
            //边绑定
            else{
                let line=this.$d3.line()
                        .x(d=>d.x)
                        .y(d=>d.y)
                links.forEach((edge_subpoint_data)=>{	
        
                    link.append("path")
                    .attr("d", line(edge_subpoint_data))
                        .attr("stroke-width", 1)
                        .attr("stroke",this.path_Stroke)
                        .attr("fill", "none")
                        .attr('stroke-opacity',.3); //use opacity as blending
                });
            }
            
            //画点
            let node=svg.append("g").attr("class",'nodeG');
            let linePt=this.$d3.line()
                        .x(d=>d[0])
                        .y(d=>d[1])
                        .curve(this.$d3.curveBasis);
            // 饼图布局
            let pie = this.$d3.pie();
            let innerRadius = 0;    // 内半径
            for(let i=0;i<nodes.length;i++){
                let g=node.append("g").attr("class","flowerG"+nodes[i].id).attr("transform",`translate(0,0)`).attr("opacity",1);
                //花瓣外环
                let maxLengthPt=this.$d3.max(classDic[nodes[i].id].shang,d=>l_scale(d))/1.5+this.addLength;//花瓣外环半径
                g.append('circle').attr("cx",nodes[i].x)
                .attr("cy",nodes[i].y).attr('fill',"white").attr("r",maxLengthPt)
                .attr("stroke-width",this.pt_Circle_Stroke_Choosed_Width).attr("stroke",this.pt_Circle_Stroke_Choosed)
                .attr("opacity",0)
                .attr("id","flowerPtCircle"+nodes[i].id)
                .attr("class","flowerCircle")
                //花瓣
                let pointsArr=this.getPetal(nodes[i],l_scale);
                g.selectAll("path").data(pointsArr).enter()
                .append("path")
                .attr("d",d=>linePt(d))
                .attr("fill",(d,i)=>this.color[i])
                .attr("stroke-width",this.pt_Stroke_Width)
                .attr("stroke",this.pt_Stroke)
                .attr("id",()=>"flowerPts"+nodes[i].id)
                .attr("class","flower")
                .attr("opacity",()=>{if(this.getForceType=="flower")return 1;else if(this.getForceType=="pie") return 0})
                .on("click",()=>{
                    //选中该类，更新store.clickClass
                    this.$store.dispatch('updateClickClass',classDic[nodes[i].id]);
                })
                // .call(this.$d3.drag()
                //     .on("drag",draged.bind(this,nodes[i].id)))

                //饼图
                //弧线生成器
                let outerRadius=pie_r_scale(classDic[nodes[i].id].num);
                //饼图外环
                let maxLengthPie=outerRadius+this.addLength;//饼图外环半径
                g.append('circle').attr("cx",nodes[i].x)
                .attr("cy",nodes[i].y).attr('fill',"white").attr("r",maxLengthPie)
                .attr("stroke-width",this.pie_Circle_Stroke_Width).attr("stroke",this.pie_Circle_Stroke)
                .attr("opacity",()=>{if(this.getForceType=="flower")return 0;else if(this.getForceType=="pie") return 1})
                .attr("id","pieCircle"+nodes[i].id)
                .attr("class","pie pieCircle")
                let sh_max=this.$d3.max(classDic[nodes[i].id].shang);
                let sh_min=this.$d3.min(classDic[nodes[i].id].shang);
                let sh_scale=this.$d3.scaleLinear().domain([sh_max,sh_min]).range([2,10])
                let pieData=classDic[nodes[i].id].shang.map(element => {
                    return sh_scale(element);
                })
                let arc_generator = this.$d3.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius);
                let gs = g.selectAll('g')
                .data(pie(pieData))
                .enter()
                .append('g')
                .attr("id",(d,j)=>"pie"+j+"_"+nodes[i].id)
                .attr("class","pie")
                .attr("opacity",()=>{if(this.getForceType=="flower")return 0;else if(this.getForceType=="pie") return 1})
                .attr('transform', `translate(${nodes[i].x},${nodes[i].y})`)

                // 绘制扇形
                gs.append('path')
                .attr('d', function (d) {
                    return arc_generator(d);
                })
                .attr('fill', (d,i)=> {
                    return this.color[i];   // 设置颜色
                })
                .on("click",()=>{
                    //选中该类，更新store.clickClass
                    this.$store.dispatch('updateClickClass',classDic[nodes[i].id]);
                })

                //花心
                g.append("circle")
                .attr("cx",nodes[i].x)
                .attr("cy",nodes[i].y)
                .attr("r",r_scale(classDic[nodes[i].id].num))
                .attr("fill",this.interpolateColor(c_scale(classDic[nodes[i].id].midu)))
                .attr("stroke",this.circle_Stroke_Width)
                .attr("stroke-width",this.circle_Stroke)
                .attr("id",()=>"flower"+nodes[i].id)
                .attr("class","flowerAndPie")
                .attr("opacity",1)
                .on("click",()=>{
                    //选中该类，更新store.clickClass
                    this.$store.dispatch('updateClickClass',classDic[nodes[i].id]);
                })
                // .call(this.$d3.drag()
                //     .on("drag",draged.bind(this,nodes[i].id)))
            }
            // function draged(id){
            //     this.$d3.select("#flower"+id).attr("cx",this.$d3.event.x).attr("cy",this.$d3.event.y);
            //     this.$d3.selectAll(".flowerPts"+id).attr("d",(d,i)=>{
            //         let path1=this.getPetal(nodesDic[id],x_scale,y_scale,l_scale,this.$d3.event.x,this.$d3.event.y)[i];
            //         return linePt(path1);
            //     })
            // }
            //画colorbar
            //定义一个线性渐变
            var defs = svg.append("defs");
            
            var linearGradient = defs.append("linearGradient")
                                    .attr("id","linearColor")
                                    .attr("x1","0%")
                                    .attr("y1","0%")
                                    .attr("x2","100%")
                                    .attr("y2","0%");
            for(let i=0;i<=1;i+=0.1){
                linearGradient.append("stop")
                        .attr("offset",`${i*100}%`)
                        .style("stop-color",this.interpolateColor(i).toString());
            }
            //添加一个矩形，并应用线性渐变
            svg.append("rect")
                    .attr("x", width-this.colorBarWidth-30)
                    .attr("y", 25)
                    .attr("width", this.colorBarWidth)
                    .attr("height", this.colorBarHeight)
                    .style("fill","url(#" + linearGradient.attr("id") + ")");
            //colorBar 文字
            svg.append("text").attr("x",width-this.colorBarWidth-20).attr('y',20).attr("font-size",10).text("Central density");
            svg.append("text").attr("x",width-this.colorBarWidth-50).attr('y',this.colorBarHeight+20).attr("font-size",10).text("low");
            svg.append("text").attr("x",width-25).attr('y',this.colorBarHeight+20).attr("font-size",10).text("high");
        },

        transition(nodes,links){
            let classDic={};
            for(let i=0;i<this.getClassNames.length;i++){
                classDic[this.getClassNames[i].name]=this.getClassNames[i];
            }
            
            //点半径比例尺(映射包含的点的数量)
            let r_max=this.$d3.max(this.getClassNames,d=>d.num);
            let r_min=this.$d3.min(this.getClassNames,d=>d.num);
            let r_scale=this.$d3.scaleLinear().domain([r_min,r_max]).range([this.radius_min,this.radius_max]);
            //饼图半径比例尺
            let pie_r_scale=this.$d3.scaleLinear().domain([r_min,r_max]).range([this.pie_R_Min,this.pie_R_Max]);
            //点颜色比例尺（映射midu属性）
            let c_max=this.$d3.max(this.getClassNames,d=>d.midu);
            let c_min=this.$d3.min(this.getClassNames,d=>d.midu);
            let c_scale=this.$d3.scaleLinear().domain([c_min,c_max]).range([0,1]);
            //花瓣长度比例尺(映射shang属性)
            let l_max=this.$d3.max(this.getClassNames,d=>{
                return this.$d3.max(d.shang);
            });
            let l_min=this.$d3.min(this.getClassNames,d=>{
                return this.$d3.min(d.shang);
            });
            let l_scale=this.$d3.scaleLinear().domain([l_max,l_min]).range([this.pt_Length_min,this.pt_Length_max]);
            //连线宽度比例尺
            let v_max=this.$d3.max(links,d=>d.value);
            let v_min=this.$d3.min(links,d=>d.value);
            let w_scale=this.$d3.scaleLinear().domain([v_min,v_max]).range([this.path_Stroke_Width_Min,this.path_Stroke_Width_Max]);
            //连线不透明度比例尺
            let o_scale=this.$d3.scaleLinear().domain([v_min,v_max]).range([this.path_Opacity_Min,this.path_Opacity_Max]);
            //nodes数组转字典
            let nodesDic={};
            for(let i=0;i<nodes.length;i++){
                nodesDic[nodes[i].id]=nodes[i];
            }
            //计算跟上次的切层相比，哪些类是保留的，哪些是消失的，哪些是新增加的
            let retain=[];//保留的点
            let increase=[];//增加的点（合成或者分解）
            let disappear=[];//消失的点
            for(let i=0;i<this.getClassNames.length;i++){
                for(let j=0;j<this.getLastClass.length;j++){
                    if(this.getClassNames[i].name==this.getLastClass[j].name){
                        retain.push(this.getClassNames[i]);
                        break;
                    }
                    if(j==this.getLastClass.length-1){
                        increase.push(this.getClassNames[i]);
                    }
                }
            }
            for(let i=0;i<this.getLastClass.length;i++){
                for(let j=0;j<this.getClassNames.length;j++){
                    if(this.getClassNames[j].name==this.getLastClass[i].name) continue;
                    if(j==this.getClassNames.length-1){
                        disappear.push(this.getLastClass[i]);
                    }
                }
            }
            //分解（对消失的点找孩子）画值对应的点，键对应的点消失
            let disappearDic={};
            for(let i=0;i<disappear.length;i++){
                let children=[];
                this.findChildren(disappear[i],this.getClassNames,children);
                if(children.length>0){
                    disappearDic[disappear[i].name]=children;
                }
            }
            //合成(对增加的点找孩子) 画键对应的点，值对应的点消失
            let increaseDic={};
            for(let i=0;i<increase.length;i++){
                let children=[];
                this.findChildren(increase[i],this.getLastClass,children);
                if(children.length>0){
                    increaseDic[increase[i].name]=children;
                }
            }

            //画图
            let svg=this.$d3.select("#svg_g");
            let linkG=svg.select(".linkG");
            linkG.selectAll("path").remove();
            let node=svg.select(".nodeG");
            let linePt=this.$d3.line()
                        .x(d=>d[0])
                        .y(d=>d[1])
                        .curve(this.$d3.curveBasis);
            // 饼图布局
            let pie = this.$d3.pie();
            let innerRadius = 0;    // 内半径
            //（1）保留的点直接改变位置
            for(let i=0;i<retain.length;i++){
                let newx=nodesDic[retain[i].name].x;
                let newy=nodesDic[retain[i].name].y;
                let oldx=parseFloat(this.$d3.select("#flower"+retain[i].name).attr('cx'));
                let oldy=parseFloat(this.$d3.select("#flower"+retain[i].name).attr('cy'));
                let transX=newx-oldx;
                let transY=newy-oldy;
                let pointsArr=this.getPetal(nodesDic[retain[i].name],l_scale,oldx,oldy);
                this.$d3.selectAll("#flowerPts"+retain[i].name)
                    .attr("d",(d,k)=>{
                        return linePt(pointsArr[k]);
                    })
                this.$d3.select(".flowerG"+retain[i].name).transition().duration(1000).ease(this.$d3.easeLinear)
                .attr("transform",`translate(${transX},${transY})`);
                this.$d3.select("#flower"+retain[i].name).transition().duration(1000).ease(this.$d3.easeLinear).attr("r",r_scale(classDic[retain[i].name].num));
                let maxLengthPt=this.$d3.max(classDic[retain[i].name].shang,d=>l_scale(d))/1.5+this.addLength;//花瓣外环半径
                this.$d3.select("#flowerPtCircle"+retain[i].name).transition().duration(1000).ease(this.$d3.easeLinear).attr("r",maxLengthPt);
                //饼图半径改变
                let outerRadius=pie_r_scale(classDic[retain[i].name].num);
                let arc_generator = this.$d3.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius);
                let pieData=pie(classDic[retain[i].name].shang);
                for(let j=0;j<pieData.length;j++){
                    this.$d3.select('#pie'+j+"_"+retain[i].name).select("path").transition().duration(1000).ease(this.$d3.easeLinear).attr("d",()=>arc_generator(pieData[j]));
                }
                let maxLengthPie=outerRadius+this.addLength;//饼图外环半径
                this.$d3.select("#pieCircle"+retain[i].name).transition().duration(1000).ease(this.$d3.easeLinear).attr("r",maxLengthPie);
            }
            //(2)分解
            for(let i in disappearDic){
                this.$d3.select(".flowerG"+i).transition().duration(1000).ease(this.$d3.easeLinear).attr("opacity",0);
                //分解源的translate
                let oldTrans=this.$d3.select(".flowerG"+i).attr("transform").substring(10).split(',');
                //分解源的真实x,y
                let oldx=(parseFloat(this.$d3.select("#flower"+i).attr('cx')))+parseFloat(oldTrans[0]);
                let oldy=(parseFloat(this.$d3.select("#flower"+i).attr('cy')))+parseFloat(oldTrans[1]);
                //画分解产生的点
                for(let j=0;j<disappearDic[i].length;j++){
                    //产生点的x,y
                    let newx=nodesDic[disappearDic[i][j].name].x;
                    let newy=nodesDic[disappearDic[i][j].name].y;
                    let transX=oldx-newx;
                    let transY=oldy-newy;

                    let g=node.append("g").attr("class","flowerG"+disappearDic[i][j].name);
                    g.attr("transform",`translate(${transX},${transY})`).attr("opacity",0)
                    .transition().duration(1000).ease(this.$d3.easeLinear).attr("transform",`translate(${0},${0})`).attr("opacity",1);
                    //花瓣外环
                    let maxLengthPt=this.$d3.max(classDic[disappearDic[i][j].name].shang,d=>l_scale(d))/1.5+this.addLength;//花瓣外环半径
                    g.append('circle').attr("cx",nodesDic[disappearDic[i][j].name].x)
                    .attr("cy",nodesDic[disappearDic[i][j].name].y).attr('fill',"white").attr("r",maxLengthPt)
                    .attr("stroke-width",this.pt_Circle_Stroke_Choosed_Width).attr("stroke",this.pt_Circle_Stroke_Choosed)
                    .attr("opacity",0)
                    .attr("id","flowerPtCircle"+nodesDic[disappearDic[i][j].name].id)
                    .attr("class","flowerCircle")
                    //花瓣
                    let pointsArr=this.getPetal(nodesDic[disappearDic[i][j].name],l_scale);
                    g.selectAll("path").data(pointsArr).enter()
                    .append("path")
                    .attr("d",d=>linePt(d))
                    .attr("fill",(d,i)=>this.color[i])
                    .attr("stroke-width",this.pt_Stroke_Width)
                    .attr("stroke",this.pt_Stroke)
                    .attr("id",()=>"flowerPts"+nodesDic[disappearDic[i][j].name].id)
                    .attr("class","flower")
                    .attr("opacity",()=>{if(this.getForceType=="flower")return 1;else if(this.getForceType=="pie") return 0})
                    .on("click",()=>{
                        //选中该类，更新store.clickClass
                        this.$store.dispatch('updateClickClass',classDic[disappearDic[i][j].name]);
                    })
                    // .call(this.$d3.drag()
                    //     .on("drag",draged.bind(this,nodesDic[disappearDic[i][j].name].id)))
                    // console.log(classDic[disappearDic[i][j].name].num)
                    //饼图
                    //弧线生成器
                    let outerRadius=pie_r_scale(classDic[disappearDic[i][j].name].num);
                    //饼图外环
                    let maxLengthPie=outerRadius+this.addLength;//饼图外环半径
                    g.append('circle').attr("cx",nodesDic[disappearDic[i][j].name].x)
                    .attr("cy",nodesDic[disappearDic[i][j].name].y).attr('fill',"white").attr("r",maxLengthPie)
                    .attr("stroke-width",this.pie_Circle_Stroke_Width).attr("stroke",this.pie_Circle_Stroke)
                    .attr("opacity",()=>{if(this.getForceType=="flower")return 0;else if(this.getForceType=="pie") return 1})
                    .attr("id","pieCircle"+nodesDic[disappearDic[i][j].name].id)
                    .attr("class","pie pieCircle")
                    let sh_max=this.$d3.max(classDic[disappearDic[i][j].name].shang);
                    let sh_min=this.$d3.min(classDic[disappearDic[i][j].name].shang);
                    let sh_scale=this.$d3.scaleLinear().domain([sh_max,sh_min]).range([2,10])
                    let pieData=classDic[disappearDic[i][j].name].shang.map(element => {
                        return sh_scale(element);
                    })
                    let arc_generator = this.$d3.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius);
                    let gs = g.selectAll('g')
                    .data(pie(pieData))
                    .enter()
                    .append('g')
                    .attr("id",(d,k)=>"pie"+k+"_"+nodesDic[disappearDic[i][j].name].id)
                    .attr("class","pie")
                    .attr("opacity",()=>{if(this.getForceType=="flower")return 0;else if(this.getForceType=="pie") return 1})
                    .attr('transform', `translate(${nodesDic[disappearDic[i][j].name].x},${nodesDic[disappearDic[i][j].name].y})`)

                    // 绘制扇形
                    gs.append('path')
                    .attr('d', function (d) {
                        return arc_generator(d);
                    })
                    .attr('fill', (d,i)=> {
                        return this.color[i];   // 设置颜色
                    })
                    .on("click",()=>{
                        //选中该类，更新store.clickClass
                        this.$store.dispatch('updateClickClass',classDic[disappearDic[i][j].name]);
                    })

                    //花心
                    g.append("circle")
                    .attr("cx",nodesDic[disappearDic[i][j].name].x)
                    .attr("cy",nodesDic[disappearDic[i][j].name].y)
                    .attr("r",r_scale(classDic[disappearDic[i][j].name].num))
                    .attr("fill",this.interpolateColor(c_scale(classDic[disappearDic[i][j].name].midu)))
                    .attr("stroke",this.circle_Stroke_Width)
                    .attr("stroke-width",this.circle_Stroke)
                    .attr("id",()=>"flower"+nodesDic[disappearDic[i][j].name].id)
                    .attr("class","flowerAndPie")
                    .attr("opacity",1)
                    .on("click",()=>{
                        //选中该类，更新store.clickClass
                        this.$store.dispatch('updateClickClass',classDic[disappearDic[i][j].name]);
                    })
                    // .call(this.$d3.drag()
                    //     .on("drag",draged.bind(this,nodesDic[disappearDic[i][j].name].id)))
                }
                setTimeout(()=>{
                    this.$d3.select(".flowerG"+i).remove();
                },1000)
                
            }
            //(3)合成
            for(let i in increaseDic){
                //画键对应的点
                let g=node.append("g").attr("class","flowerG"+i);
                g.attr("transform",`translate(0,0)`).attr("opacity",0).transition().duration(1000).ease(this.$d3.easeLinear).attr("opacity",1);
                //花瓣外环
                let maxLengthPt=this.$d3.max(classDic[nodesDic[i].id].shang,d=>l_scale(d))/1.5+this.addLength;//花瓣外环半径
                g.append('circle').attr("cx",nodesDic[i].x)
                .attr("cy",nodesDic[i].y).attr('fill',"white").attr("r",maxLengthPt)
                .attr("stroke-width",this.pt_Circle_Stroke_Choosed_Width).attr("stroke",this.pt_Circle_Stroke_Choosed)
                .attr("opacity",0)
                .attr("id","flowerPtCircle"+nodesDic[i].id)
                .attr("class","flowerCircle")
                //花瓣
                let pointsArr=this.getPetal(nodesDic[i],l_scale);
                g.selectAll("path").data(pointsArr).enter()
                .append("path")
                .attr("d",d=>linePt(d))
                .attr("fill",(d,i)=>this.color[i])
                .attr("stroke-width",this.pt_Stroke_Width)
                .attr("stroke",this.pt_Stroke)
                .attr("id",()=>"flowerPts"+nodesDic[i].id)
                .attr("class","flower")
                .attr("opacity",()=>{if(this.getForceType=="flower")return 1;else if(this.getForceType=="pie") return 0})
                .on("click",()=>{
                    //选中该类，更新store.clickClass
                    this.$store.dispatch('updateClickClass',classDic[nodesDic[i].id]);
                })
                // .call(this.$d3.drag()
                //     .on("drag",draged.bind(this,nodesDic[i].id)))
                //饼图
                //弧线生成器
                let outerRadius=pie_r_scale(classDic[nodesDic[i].id].num);
                //饼图外环
                let maxLengthPie=outerRadius+this.addLength;//饼图外环半径
                g.append('circle').attr("cx",nodesDic[i].x)
                .attr("cy",nodesDic[i].y).attr('fill',"white").attr("r",maxLengthPie)
                .attr("stroke-width",this.pie_Circle_Stroke_Width).attr("stroke",this.pie_Circle_Stroke)
                .attr("opacity",()=>{if(this.getForceType=="flower")return 0;else if(this.getForceType=="pie") return 1})
                .attr("id","pieCircle"+nodesDic[i].id)
                .attr("class","pie pieCircle")
                let sh_max=this.$d3.max(classDic[nodesDic[i].id].shang);
                let sh_min=this.$d3.min(classDic[nodesDic[i].id].shang);
                let sh_scale=this.$d3.scaleLinear().domain([sh_max,sh_min]).range([2,10])
                let pieData=classDic[nodesDic[i].id].shang.map(element => {
                    return sh_scale(element);
                })
                let arc_generator = this.$d3.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius);
                let gs = g.selectAll('g')
                .data(pie(pieData))
                .enter()
                .append('g')
                .attr("id",(d,j)=>"pie"+j+"_"+nodesDic[i].id)
                .attr("class","pie")
                .attr("opacity",()=>{if(this.getForceType=="flower")return 0;else if(this.getForceType=="pie") return 1})
                .attr('transform', `translate(${nodesDic[i].x},${nodesDic[i].y})`)

                // 绘制扇形
                gs.append('path')
                .attr('d', function (d) {
                    return arc_generator(d);
                })
                .attr('fill', (d,i)=> {
                    return this.color[i];   // 设置颜色
                })
                .on("click",()=>{
                    //选中该类，更新store.clickClass
                    this.$store.dispatch('updateClickClass',classDic[nodesDic[i].id]);
                })

                //花心
                g.append("circle")
                .attr("cx",nodesDic[i].x)
                .attr("cy",nodesDic[i].y)
                .attr("r",r_scale(classDic[nodesDic[i].id].num))
                .attr("fill",this.interpolateColor(c_scale(classDic[nodesDic[i].id].midu)))
                .attr("stroke",this.circle_Stroke_Width)
                .attr("stroke-width",this.circle_Stroke)
                .attr("id",()=>"flower"+nodesDic[i].id)
                .attr("class","flowerAndPie")
                .attr("opacity",1)
                .on("click",()=>{
                    //选中该类，更新store.clickClass
                    this.$store.dispatch('updateClickClass',classDic[nodesDic[i].id]);
                })
                // .call(this.$d3.drag()
                //     .on("drag",draged.bind(this,nodesDic[i].id)))

                //值对应的点消失
                let newx=nodesDic[i].x;
                let newy=nodesDic[i].y;
                for(let j=0;j<increaseDic[i].length;j++){
                    let oldx=parseFloat(this.$d3.select("#flower"+increaseDic[i][j].name).attr('cx'));
                    let oldy=parseFloat(this.$d3.select("#flower"+increaseDic[i][j].name).attr('cy'));
                    let transX=newx-oldx;
                    let transY=newy-oldy;
                    this.$d3.select(".flowerG"+increaseDic[i][j].name).transition().duration(1000).ease(this.$d3.easeLinear)
                    .attr("transform",`translate(${transX},${transY})`).attr("opacity",0)

                    setTimeout(()=>{
                        this.$d3.select(".flowerG"+increaseDic[i][j].name).remove();
                    },1000)
                }
            }
            // function draged(id){
            //     this.$d3.select("#flower"+id).attr("cx",this.$d3.event.x).attr("cy",this.$d3.event.y);
            //     this.$d3.selectAll(".flowerPts"+id).attr("d",(d,i)=>{
            //         let path1=this.getPetal(nodesDic[id],x_scale,y_scale,l_scale,this.$d3.event.x,this.$d3.event.y)[i];
            //         return linePt(path1);
            //     })
            // }
            //画线
            var line=this.$d3.line()
                        .x(d=>d[0])
                        .y(d=>d[1])
                        .curve(this.$d3.curveBasis);
            setTimeout(()=>{
                for(let i=0;i<links.length;i++){
                    let source_Trans=this.$d3.select(".flowerG"+links[i].source).attr("transform").substring(10).split(',');
                    let target_Trans=this.$d3.select(".flowerG"+links[i].target).attr("transform").substring(10).split(',');
                    let s_x=parseFloat(this.$d3.select("#flower"+links[i].source).attr('cx'))+parseFloat(source_Trans[0]);
                    let s_y=parseFloat(this.$d3.select("#flower"+links[i].source).attr('cy'))+parseFloat(source_Trans[1]);
                    let t_x=parseFloat(this.$d3.select("#flower"+links[i].target).attr('cx'))+parseFloat(target_Trans[0]);
                    let t_y=parseFloat(this.$d3.select("#flower"+links[i].target).attr('cy'))+parseFloat(target_Trans[1]);
                    let point=[[s_x,s_y],[t_x,t_y]]
                    linkG.append("path")
                        .attr("fill",this.path_Fill)
                        .attr("stroke-width",w_scale(links[i].value))
                        .attr("stroke-opacity",o_scale(links[i].value))
                        .attr("stroke",this.path_Stroke)
                        .attr("d",line([point[0],point[0]]))
                        .transition()
                        .duration(500)
                        // .delay(100*i)
                        .ease(this.$d3.easeLinear)
                        .attr('d',line(point))

                }
            },1000)
            
        },
        //力布局
        forceLayout(isInit){//isInit 是否是初始化 bool
            //获得边（暂且当做全连接）
            let edgeArr=[];
            //向后台请求类之间的连接
            this.$axios.post('http://localhost:5000/classLink/findClassLink',{
                classes:this.getClassNames,
                label:this.getLabel,
                type:this.getType,
            })
            .then((res)=>{
                edgeArr=res.data;
                // edgeArr=[];
                //对点数组处理
                let r_max=this.$d3.max(this.getClassNames,d=>d.num);
                let r_min=this.$d3.min(this.getClassNames,d=>d.num);
                //饼图半径比例尺
                let pie_r_scale=this.$d3.scaleLinear().domain([r_min,r_max]).range([this.pie_R_Min,this.pie_R_Max]);
                var nodesid = [];
                for (let i = 0; i < this.getClassNames.length; i++) {
                    nodesid.push({
                        id: parseInt(this.getClassNames[i].name),
                        rx: pie_r_scale(this.getClassNames[i].num),
                        ry:pie_r_scale(this.getClassNames[i].num),
                        children:this.getClassNames[i].children,
                        contain:this.getClassNames[i].ids,
                        parent:this.getClassNames[i].parent,
                        midu:this.getClassNames[i].midu,
                        num:this.getClassNames[i].num,
                        shang:this.getClassNames[i].shang,
                    })
                }
                //对边数组处理
                var links = [];
                for (let i = 0; i < edgeArr.length; i++) {
                    links.push({
                        source: parseInt(edgeArr[i].source),
                        target: parseInt(edgeArr[i].target),
                        value:edgeArr[i].value,
                    })
                }
                let v_max=this.$d3.max(links,d=>d.value);
                let v_min=this.$d3.min(links,d=>d.value);
                let v_scale=this.$d3.scaleLinear().domain([v_max,v_min]).range([100,400]);//连value越大，距离越近
                
                //布局
                const width = this.$refs.svg.clientWidth;
                const height = this.$refs.svg.clientHeight;
                var simulation=this.$d3.forceSimulation(nodesid);
                simulation 
                .force("link", this.$d3.forceLink(links).distance(d=>v_scale(d.value)).id(d => d.id))//
                .force("collide", d3Force.ellipseForce())
                .force("charge", this.$d3.forceManyBody())
                .force("center", this.$d3.forceCenter(width / 2, height / 2))
                .on('tick', function () {
                    // console.log("waiting...");
                })
                .on("end",()=>{
                    console.log("布局结束");
                    // let nodesDic={};
                    // for(let i=0;i<nodesid.length;i++){
                    //     nodesDic[nodesid[i].id]={x:nodesid[i].x,y:nodesid[i].y};
                    // }
                    // var fbundling = ForceEdgeBundling()
                    // .step_size(10)
                    // .compatibility_threshold(0.9)
                    // .nodes(nodesDic)
                    // .edges(edgeArr);
                    // var results = fbundling();
                    // console.log(results)
                    //如果是初始化直接画图
                    if(isInit){
                        // this.draw(nodesid,results,true);
                        this.draw(nodesid,edgeArr,false);
                    }
                    //否则动画过度
                    else{
                        this.transition(nodesid,edgeArr);
                    }
                    
                })
            })
        },
        //根据半径和角度获得二次贝塞尔曲线控制点坐标
        P2L(r, angle){
            var ret = {x:0, y:0};
            ret.x = Math.cos(angle*Math.PI/180)*r;
            ret.y = Math.sin(angle*Math.PI/180)*r;
            return (ret);
        },
        // 获得花瓣的坐标
        getPetal(node,l_scale,x,y){

            //花瓣的数量*2等于属性的数量*2
            let _num_pts=node.shang.length*2;
            // let _num_pts=10
            
            //初始角度
            let init_angle=0;
            //圆心位置
            let _x;
            let _y;
            if(x){
                _x=x;
                _y=y;
            }
            else{
                _x=node.x;
                _y=node.y;
            }
            
            //保留每个花瓣path的坐标
            let PetalsLocation=[];
            for(let i=1;i<=_num_pts;i+=2){
                //每个花瓣的半径
                let _rad=l_scale(node.shang[parseInt(i/2)]);
                //二次贝塞尔曲线控制点坐标
                let _a1=(360/_num_pts) * (i-1) + init_angle ;
                let _a2=(360/_num_pts) * (i+1) + init_angle ;
                let pt1={x:this.P2L(_rad, _a1).x,y:this.P2L(_rad, _a1).y}
                let pt2={x:this.P2L(_rad, _a2).x,y:this.P2L(_rad, _a2).y}
                let point=[[_x,_y],[_x+pt1.x,_y+pt1.y],[_x+pt2.x,_y+pt2.y],[_x,_y]];
                PetalsLocation.push(point);
            }
            return PetalsLocation;
        },
        isExit(node,collection){
            for(let j=0;j<collection.length;j++){
                    if(collection[j].name==node.name){
                        return true;
                    }
            }
        },
        //查找哪个孩子结点在collection中
        findChildren(node,collection,children){
            if(node.hasOwnProperty("children")){
                
                for(let i=0;i<node.children.length;i++){
                    if(this.isExit(node.children[i],collection)){
                        children.push(node.children[i]);
                    }
                    this.findChildren(node.children[i],collection,children);
                }
            }
        },
       
    },
    watch:{
        getClassNames:function(){
            // 如果是初始化则直接画
            if(this.getLastClass.length==0){
                this.forceLayout(true);
            }
            //如果是手动切割或者目标函数切割则动画过度
            else{
                this.forceLayout(false);
            }
            // this.forceLayout(true);
        },
        //监听力导图展示类型
        getForceType:function(){
            if(this.getForceType=="flower")
            {
                this.$d3.selectAll('.pie').transition().duration(500).ease(this.$d3.easeLinear).attr("opacity",0);
                this.$d3.selectAll('.flower').transition().duration(1000).ease(this.$d3.easeLinear).attr("opacity",1);
                if(this.getClickClass){
                    this.$d3.select('#flowerPtCircle'+this.getClickClass.name).attr("opacity",1);
                }
            }
            else if(this.getForceType=="pie"){
                this.$d3.selectAll('.flower').transition().duration(500).ease(this.$d3.easeLinear).attr("opacity",0);
                this.$d3.selectAll('.pie').transition().duration(1000).ease(this.$d3.easeLinear).attr("opacity",1);
                if(this.getClickClass){
                    this.$d3.select('#flowerPtCircle'+this.getClickClass.name).attr("opacity",0);
                }
            }
        },
        //监听点击某个类
        getClickClass:function(){
            this.$d3.selectAll('.flowerCircle').attr("opacity",0);
            this.$d3.selectAll('.pieCircle').attr("stroke",this.pie_Circle_Stroke);
            this.$d3.select('#pieCircle'+this.getClickClass.name).attr("stroke",this.pie_Circle_Stroke_Choosed);
            if(this.getForceType=="flower"){
                this.$d3.select('#flowerPtCircle'+this.getClickClass.name).attr("opacity",1);
            }
        }
    }
}
</script>

<style scoped>
.box{
    width:100%;
    height: 100%;
    position: relative;
}
</style>