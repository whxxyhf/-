<template>
    <div class="box">
        <!--能量函数-->
        <div class="top">
            <!-- <el-checkbox-group v-model="initAtrrrs">
                <el-checkbox-button :label="value" :id="'input_'+index"  v-for="(value,index) in attributions" :key="index" @change="updateOne(index)">
                </el-checkbox-button>
            </el-checkbox-group> -->
            <input type="button" :value="value" v-for="(value,index) in attributions" :key="index" @click="updateOne(index)">
            <input type="button" value="Cut" @click="cut">
            <input type="button" value="Em" style="margin-left:10px;">
        </div>

        <!--tree-->
        <div class="middle">
            <svg style="width:100%;height:100%;" ref="svg" id="svg_tree">
            
            </svg>
        </div>

        <!--波动-->
        <div class="bottom">
                
        </div>
        
    </div>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'
export default {
    name:'Tree',
    props:['tree','chooseNode'],
    data(){
        return {
            circle_Fill:this.$d3.interpolateBlues,
            circle_R:3,
            circle_Stroke:"#ccc",
            circle_Stroke_Choose:"orange",
            circle_Stroke_Click:"red",
            circle_Stroke_Width:0.5,
            line_Stroke_Width:1,
            line_Stroke:'steelblue',
            radius_min:2,
            radius_max:5,
            splitLine_Width:2,//分割线宽度
            splitLine_Stroke:"red",//分割线颜色
            color:["#FF3030","#FF00FF","#C0FF3E","#87CEFA","#FFC0CB"],
            attributions:[],//["year","country","people","tech","count"],
            initAtrrrs:[],
            choosedAttrs:[false,false,false,false,false],//选择了哪些属性
            padding:{
                top:10,
                left:10,
            },
            history_shang:[],
            treeNode:{},//树布局转化后的节点
        }
    },
    computed:{
        ...mapGetters(['getClickClass','getClassNames','getAttributions']),
    },
    methods:{
        ...mapActions(['updateClassNames']),
        updateOne(index){
            var event = window.event||arguments[0];
            this.choosedAttrs[index]=!this.choosedAttrs[index];
            if(this.choosedAttrs[index]){
                event.target.style.background=this.color[index];
            }
            else{
                event.target.style.background="#FFF";
            }
            let indexArr=[];
            for(let i=0;i<this.choosedAttrs.length;i++){
                if(this.choosedAttrs[i]){
                    indexArr.push(i);
                }
            }
        },
        //自顶向下找最优层
        // BestSolution(indexArr,root){

        // },
        drawTree(){
            //获得svg的长宽
            var width=this.$refs.svg.clientWidth-this.padding.left*2;
            var height=this.$refs.svg.clientHeight-this.padding.top*6;
            var svg=this.$d3.select("#svg_tree");
            //d3树布局
            svg.selectAll("g").remove();
            svg.selectAll("path").remove();
            svg.selectAll("rect").remove();
            var tree=this.$d3.tree().size([width,height])(this.$d3.hierarchy(this.tree));
            var g=svg.append("g").attr("transform", `translate(${this.padding.left},${this.padding.top})`);
            this.treeNode={};
            for(let i=0;i<tree.descendants().length;i++){
                this.treeNode[tree.descendants()[i].data.name]=tree.descendants()[i];
            }
            //点半径比例尺
            let r_max=this.$d3.max(tree.descendants(),d=>d.data.num);
            let r_min=this.$d3.min(tree.descendants(),d=>d.data.num);
            let r_scale=this.$d3.scaleLinear().domain([r_min,r_max]).range([this.radius_min,this.radius_max]);
            //点颜色比例尺（映射平均熵属性）
            let c_max=this.$d3.max(tree.descendants(),d=>this.$d3.mean(d.data.shang));
            let c_min=this.$d3.min(tree.descendants(),d=>this.$d3.mean(d.data.shang));
            let c_scale=this.$d3.scaleLinear().domain([c_min,c_max]).range([0,1]);

            let links=g.append("g");
            links
            .selectAll("path")
            .data(tree.links())
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", "#555")
            .attr("stroke-opacity", 0.4)
            .attr("opacity",d=>{
                if(d.target.data.ifsan==1){
                    return 0;
                }
                return .4;
            })
            .attr("stroke-width", this.line_Stroke_Width)
            .attr("d", this.$d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y))
            
            let node = g.append("g")
            .selectAll("g")
            .data(tree.descendants())
            .enter()
            .append("g")
            .attr("transform", d => `translate(${d.x},${d.y})`);

            //找到分层点的坐标
            let pathPoints=[];
            for(let i=0;i<tree.descendants().length;i++){
                for(let j=0;j<this.chooseNode.length;j++){
                    if(this.chooseNode[j].name==tree.descendants()[i].data.name){
                        pathPoints.push([tree.descendants()[i].x+this.padding.left,tree.descendants()[i].y+this.padding.top]);
                    }
                }
            }
            //画分层线
            let line=this.$d3.line().curve(this.$d3.curveStep);
            svg.append("path")
            .attr("fill","none")
            .attr("stroke",this.splitLine_Stroke)
            .attr("stroke-width",this.splitLine_Width)
            .attr("id","choosedPath")
            .attr("d",line(pathPoints))
            .attr("stroke-opacity",.3)         
            // console.log(tree.descendants())
            //画树结点
            node.append("circle")
            .attr("fill",d=>this.circle_Fill(c_scale(this.$d3.mean(d.data.shang))))
            .attr("stroke",d=>{
                for(let j=0;j<this.chooseNode.length;j++){
                    if(this.chooseNode[j].name==d.data.name){
                        return this.circle_Stroke_Choose;
                    }
                }
                return this.circle_Stroke;
            })
            .attr("stroke-width",this.circle_Stroke_Width)
            .style("cursor","pointer")
            .attr("id",(d)=>{
                if(d.data.ifsan==0)
                    return "treeNode"+d.data.name;
            })
            .attr("opacity",d=>{
                if(d.data.ifsan==0){
                    return 1;
                }
                return 0;
            })
            .on("click",(d)=>{
                
                //找后代，看有没有后代在之前的分层中
                let children=[];
                this.findChildren(d,children);
                //如果找到了
                // console.log("children:",children)
                if(children.length>0){
                    for(let j=0;j<children.length;j++){
                        //取消选中状态
                        this.$d3.select("#treeNode"+children[j].data.name).attr("stroke",this.circle_Stroke);
                        for(let i=0;i<this.chooseNode.length;i++){
                            if(this.chooseNode[i].name==children[j].data.name){
                                if(j==0){
                                    this.chooseNode.splice(i,1,d.data);
                                    pathPoints.splice(i,1,[d.x+this.padding.left,d.y+this.padding.top]);
                                }
                                else{
                                    this.chooseNode.splice(i,1);
                                    pathPoints.splice(i,1)
                                }
                            }
                        }
                    }
                    //选中当前点
                    this.$d3.select("#treeNode"+d.data.name).attr("stroke",this.circle_Stroke_Choose);
                }
                else{
                    let root=this.findRoot(d);
                    // console.log("root:",root);
                    if(root){
                        let brothers=[];
                        this.findBrothers(root,d.depth,brothers);
                        // console.log("brothers:",brothers);
                        let index=0;
                        for(let j=0;j<brothers.length;j++){
                            //增加选中状态
                            this.$d3.select("#treeNode"+brothers[j].data.name).attr("stroke",this.circle_Stroke_Choose);
                            index++;
                            if(j==0){
                                for(let i=0;i<this.chooseNode.length;i++){
                                    if(this.chooseNode[i].name==root.data.name){
                                        this.chooseNode.splice(i,1,brothers[j].data);
                                        pathPoints.splice(i,1,[brothers[j].x+this.padding.left,brothers[j].y+this.padding.top]);
                                        index=i;
                                    }
                                }
                            }
                            else{
                                this.chooseNode.splice(index,0,brothers[j].data);
                                pathPoints.splice(index,0,[brothers[j].x+this.padding.left,brothers[j].y+this.padding.top]);
                            }
                            
                        }
                        //取消祖先节点的选中状态
                        this.$d3.select("#treeNode"+root.data.name).attr("stroke",this.circle_Stroke);
                    }
                    else{
                        alert("出错了！")
                    }
                    
                }
            })
            .attr("r", d=>r_scale(d.data.num));

            //画最底层结点
            let maxHeight=this.padding.top*5.5;
            let minHeight=this.padding.top*2;
            let nodesCount=[];
            for(let i in this.treeNode){
                if(this.treeNode[i].data.ifsan==1){
                    nodesCount.push(this.treeNode[i].data.num);
                }
            }
            //矩形高度比例尺
            let h_max=this.$d3.max(nodesCount);
            let h_min=this.$d3.min(nodesCount);
            let h_scale=this.$d3.scaleLinear().domain([h_min,h_max]).range([minHeight,maxHeight]);
            for(let i in this.treeNode){
                if(this.treeNode[i].data.ifsan==1){
                    let rectG=g.append('g').attr("id","treeNode"+this.treeNode[i].data.name);
                    let x=this.treeNode[i].parent.x;
                    let rectWidth=4;
                    let rectHeight=h_scale(this.treeNode[i].data.num);
                    let y=this.$refs.svg.clientHeight-rectHeight-this.padding.top*1.5;
                    this.treeNode[i].x=x;
                    this.treeNode[i].y=y;
                    let shang_max=this.$d3.max(this.treeNode[i].data.shang);
                    let shang_min=this.$d3.min(this.treeNode[i].data.shang);
                    let sh_scale=this.$d3.scaleLinear().domain([shang_max,shang_min]).range([1,2]);
                    let shang=this.treeNode[i].data.shang.map(value=>{
                        return sh_scale(value);
                    });
                    let shang_sum=this.$d3.sum(shang);
                    let pathPointsData=[[x,this.treeNode[i].parent.y],[x,y]];
                    rectG.append("path")
                        .attr("d",line(pathPointsData))
                        .attr("fill", "none")
                        .attr("stroke", "#555")
                        .attr("stroke-opacity", 0.4)
                        .attr("stroke-width", this.line_Stroke_Width)
                    for(let j=0;j<this.treeNode[i].data.shang.length;j++){
                        rectG.append("rect")
                        .attr("x",x-rectWidth/2)
                        .attr('y',y)
                        .attr("width",rectWidth)
                        .attr("height",rectHeight*shang[j]/shang_sum)
                        .attr("fill",this.color[j])
                        .on("click",()=>{
                            let root=this.findRoot(this.treeNode[i]);
                            // console.log("root:",root);
                            if(root){
                                let brothers=[];
                                this.findBrothers(root,this.treeNode[i].depth,brothers);
                                // console.log("brothers:",brothers);
                                let index=0;
                                for(let j=0;j<brothers.length;j++){
                                    //增加选中状态
                                    this.$d3.select("#treeNode"+brothers[j].data.name).attr("stroke",this.circle_Stroke_Choose);
                                    index++;
                                    if(j==0){
                                        for(let i=0;i<this.chooseNode.length;i++){
                                            if(this.chooseNode[i].name==root.data.name){
                                                this.chooseNode.splice(i,1,brothers[j].data);
                                                index=i;
                                            }
                                        }
                                    }
                                    else{
                                        this.chooseNode.splice(index,0,brothers[j].data);
                                    }
                                    
                                }
                                //取消祖先节点的选中状态
                                this.$d3.select("#treeNode"+root.data.name).attr("stroke",this.circle_Stroke);
                            }
                        })
                        y+=rectHeight*shang[j]/shang_sum;
                    }
                    
                    
                }
            }
        },
        isExit(node){
            for(let j=0;j<this.chooseNode.length;j++){
                    if(this.chooseNode[j].name==node.data.name&&this.chooseNode[j].ifsan==node.data.ifsan){
                        return true;
                    }
            }
        },
        //查找哪个孩子结点在class中
        findChildren(node,children){
            if(node.hasOwnProperty("children")){
                
                for(let i=0;i<node.children.length;i++){
                    if(this.isExit(node.children[i])){
                        children.push(node.children[i]);
                    }
                    this.findChildren(node.children[i],children);
                }
            }
        },
        //查找哪个祖先结点在class中
        findRoot(node){
            if(node.parent){
                if(this.isExit(node.parent)){
                    return node.parent;
                }
                else{
                    return this.findRoot(node.parent)
                }
            }
            else{
                return null;
            }
        },
        //根据祖先结点和当前结点的depth找兄弟结点
        findBrothers(root,depth,brothers){
            if(root.hasOwnProperty("children")){
                for(let i=0;i<root.children.length;i++){
                    if(root.children[i].depth==depth){
                        brothers.push(root.children[i]);
                        continue;
                    }
                    this.findBrothers(root.children[i],depth,brothers);
                }
            }
            else{
                if(root.depth<=depth){
                    brothers.push(root);
                }
            }
        },
        //选择层后剪切
        cut(){
            this.chooseNode.push(1);
            this.$store.dispatch('updateCutFlag',true);
            //更新lastClass
            let lastClass=[];
            for(let i=0;i<this.$store.state.classNames.length;i++){
                lastClass.push(this.$store.state.classNames[i]);
            }
            this.$store.dispatch('updateLastClass',lastClass);
            this.chooseNode.pop();
        }
    },
    watch:{
        tree:function(){
            this.drawTree();
        },
        //监听点击了某个类
        getClickClass:function(){
            
        },
        getClassNames:function(){
            let pathPoints=[];
            for(let i=0;i<this.getClassNames.length;i++){
                    pathPoints.push([this.treeNode[this.getClassNames[i].name].x+this.padding.left,this.treeNode[this.getClassNames[i].name].y+this.padding.top]);
            }
            let line=this.$d3.line().curve(this.$d3.curveStep);
            this.$d3.select("#choosedPath")
                        .transition()
                        .duration(500)
                        .ease(this.$d3.easeLinear)
                        .attr("d",line(pathPoints));
        },
        getAttributions:function(){
            this.attributions=this.getAttributions;
        }
    },
    
}
</script>

<style scoped>
.box{
    width:100%;
    height: 100%;
    position: relative;
}
.top{
    width:100%;
    height:12%;
    box-sizing: border-box;
    border-bottom: 1px solid #409EFF;
    padding: 0px 5px;
}

.bottom{
    width:100%;
    height:20%;
    
}

.middle{
    width:100%;
    height:70%;
    box-sizing: border-box;
    border-bottom: 1px solid #409EFF;
}

.top input{
    display: inline-block;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    background: #FFF;
    border: 1px solid #DCDFE6;
    color: #606266;
    -webkit-appearance: none;
    text-align: center;
    box-sizing: border-box;
    outline: 0;
    margin: 3px 2px;
    transition: .1s;
    font-size: 12px;
    border-radius: 4px;
    padding:3px 5px;
    height:25px;
}
.top input:active{
    position: relative;
    top:1px;
}
.el-checkbox-button{
    width:30px;
    height:20px;
}
.el-checkbox-button__inner{
    padding: 2px 2px !important;
    font-size: 12px !important;
}
</style>