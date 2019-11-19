<template>
    <div class="box">
        <svg style="width:100%;height:100%;" id="svg_tsne">
            <g>
                <circle v-for="(value,key) in nodes" :key="key" :cx="value.x" :cy="value.y" :id="'tsne'+key" :r="circle_R" 
                :style="{'fill':circle_Fill,'stroke':circle_Stroke,'strokeWidth':circle_Stroke_Width}"></circle>
            </g>
            <g class="pathG">
            </g>
        </svg>
    </div>
</template>

<script>
export default {
    name:'Tsne',
    props:[
        'nodes',
        'chooseClass',]
    ,
    data(){
        return {
            circle_Fill:"#ccc",
            circle_R:1.5,
            circle_Stroke:"steelblue",
            circle_Stroke_Width:0.5,
            path_Fill:"#EEEE00",
            path_Stroke:"#EE0000",
            path_Stroke_Width:1.5,
            path_Stroke_Opacity:.2,
            path_Fill_Opacity:.1,
            isFirst:true,
        }
    },
    methods:{
        drawPath(){
            // let color=["#FF3030","#FF00FF","#C0FF3E","#87CEFA"]
            this.$d3.select(".pathG").selectAll("path").remove();
            let line=this.$d3.line()
                        .x(d=>d[0])
                        .y(d=>d[1])
                        .curve(this.$d3.curveBasis)
            for(let i=0;i<this.chooseClass.length;i++){
                //每类包含的点的坐标
                let nodes_x_y=[];
                for(let j=0;j<this.chooseClass[i].ids.length;j++){
                    if(this.nodes.hasOwnProperty(this.chooseClass[i].ids[j])){
                        nodes_x_y.push([this.nodes[this.chooseClass[i].ids[j]].x,this.nodes[this.chooseClass[i].ids[j]].y]);
                        // this.$d3.select(".pathG").append("circle")
                        // .attr("cx",this.nodes[this.chooseClass[i].id[j]].x)
                        // .attr("cy",this.nodes[this.chooseClass[i].id[j]].y)
                        // .attr("r",1.5)
                        // .attr("fill",color[i])
                    }
                    // this.$d3.select("#tsne"+this.chooseClass[i].id[j]).style("fill",color[i])
                }
                //使用凸包计算轮廓
                let points=this.$d3.polygonHull(nodes_x_y);
                //首尾连接
                points.push(points[0]);
                //画区域
                this.$d3.select(".pathG")
                    .append("path")
                    .attr("d",line(points))
                    .attr("fill",this.path_Fill)
                    .attr("stroke",this.path_Stroke)
                    .attr("stroke-width",this.path_Stroke_Width)
                    .attr("fill-opacity",this.path_Fill_Opacity)
                    .attr("stroke-opacity",this.path_Stroke_Opacity)
            }
        },
         
    },
    watch:{
        nodes:function(){
            console.log("tsne 加载完毕")
            this.drawPath();
            //初始化后等class数据更新后再渲染
            this.isFirst=false;
        },
        chooseClass:function(){
            if(!this.isFirst){
                this.drawPath();
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