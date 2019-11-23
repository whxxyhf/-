<template>
    <div class="box">
        <svg style="width:100%;height:100%;" id="svg_parallel">
            
        </svg>
    </div>
</template>

<script>
import {mapGetters} from 'vuex';
export default {
    name:'Parallel',
    data(){
        return {
            attrData:[],
            zhou_color:"steelblue",
            zhou_width:2,
            path_stroke:"#ccc",
            path_stroke_width:.5,
            path_opacity:.3,
            //选中的path的颜色
            path_stroke_choosed:"red",
            
        }
    },
    computed:{
        ...mapGetters(['getLabel','getType','getClickClass']),
    },
    methods:{
        draw(attrData){
            let svg=this.$d3.select("#svg_parallel");
            svg.selectAll("g").remove();
            let count=0;//轴的数量
            let attrs=[];
            for(let i in this.attrData[0].attr){
                count++;
                attrs.push(i);
            }
            //获取画布高度宽度
            let width=document.getElementById('svg_parallel').clientWidth;
            let height=document.getElementById('svg_parallel').clientHeight;
            let padding={top:30,bottom:20,left:20,right:20};
            //每个轴之间的间隔
            let gap=(width-padding.left-padding.right)/(count-1);
            //每个轴的x坐标
            let X=[];
            for(let i=0;i<count;i++){
                X.push(padding.left+i*gap);
            }
            //每个轴的上端点和下端点
            let Y=[padding.top,height-padding.bottom];
            //画轴
            let g=svg.append("g");
            for(let i=0;i<count;i++){
                g.append("line").attr("x1",X[i]).attr("x2",X[i]).attr("y1",Y[0]).attr("y2",Y[1])
                .attr("fill","none").attr("stroke",this.zhou_color).attr("stroke-width",this.zhou_width);
                g.append("text")
                .attr("x",X[i]-15)
                .attr("y",20)
                .attr("font-size",10)
                .text(attrs[i])
            }
            //取出没种属性有几种类型的数据（全部当做离散型）
            let arrArr=[];
            let scaleArr=[];
            for(let i=0;i<count;i++){
                arrArr.push([]);
            }
            for(let i=0;i<this.attrData.length;i++){
                let index=0;
                for(let j in this.attrData[i].attr){
                    arrArr[index].push(this.attrData[i].attr[j]);
                    index++;
                }
            }
            for(let i=0;i<arrArr.length;i++){
                arrArr[i]=Array.from(new Set(arrArr[i])).sort((a,b)=>(b-a));
            }
            //每个属性的比例尺
            for(let i=0;i<count;i++){
                let y=[];
                let zhou_step=(height-padding.top-padding.bottom)/(arrArr[i].length-1);
                for(let j=0;j<arrArr[i].length;j++){
                    y.push(padding.top+zhou_step*j);
                }
                let scale=this.$d3.scaleOrdinal().domain(arrArr[i]).range(y);
                scaleArr.push(scale);
            }
            //画线
            let line=this.$d3.line();
            let pathG=svg.append("g");
            pathG.selectAll("path").data(attrData).enter()
            .append("path")
            .attr("fill","none")
            .attr("stroke",this.path_stroke)
            .attr("stroke-width",this.path_stroke_width)
            .attr("opacity",this.path_opacity)
            .attr("id",d=>"path_"+d.name)
            .attr("d",(d)=>{
                let index=0;
                let points=[];
                for(let i in d.attr){
                    points.push([X[index],scaleArr[index](d.attr[i])]);
                    index++;
                }
                return line(points);
            })
            
        },
        changeColor(){
            //移除上一次画的选中的线
            this.$d3.selectAll(".choosedPath").remove();
            //画选中的线
            let g=this.$d3.select("#svg_parallel").append("g").attr("class","choosedPath")
            for(let i=0;i<this.getClickClass.ids.length;i++){
                let pathD=this.$d3.select("#path_"+this.getClickClass.ids[i]).attr("d");
                g.append("path")
                .attr("fill","none")
                .attr("stroke",this.path_stroke_choosed)
                .attr("stroke-width",this.path_stroke_width)
                .attr("opacity",this.path_opacity)
                .attr("d",pathD)
            }
        },
        getAttrData(){
            this.$axios.post('http://localhost:5000/tsne/findAllAttr',{
                label:this.getLabel,
                type:this.getType,
            })
            .then((res)=>{
                this.attrData=res.data;
            })
        },
    },
    mounted(){
        this.getAttrData();
    },
    watch:{
        //获得属性数据后画图
        attrData:function(){
            this.draw(this.attrData);
        },
        //选中的类包含的点发生变化时，对应的线变颜色
        getClickClass:function(){
            this.changeColor();
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