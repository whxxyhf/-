<template>
    <div class="box">
        <el-button-group>
            <el-button v-for="(value,index) in attributions" :key="index" size="mini" @click="changeBtnColor(index)">{{value}}</el-button>
        </el-button-group>
        <div class="colorPanel">
            <div class="colorItem" v-for="(value,index) in chooseColor" :key="index">
                <span>class{{index}}:</span><el-color-picker v-model="chooseColor[index]" size="mini" @change="changeEvent(chooseAttrIndex,index)"></el-color-picker>
            </div>
        </div>
        <svg style="width:100%;height:100%;">
            <g>
                <path v-for="(value,index) in links" :key="index" :d="'M'+nodes[value.source].x+' '+nodes[value.source].y
                +' L'+nodes[value.target].x+' '+nodes[value.target].y" :style="{'fill':line_Fill,'stroke':line_Stroke,
                'strokeWidth':line_stroke_Width,'strokeOpacity':line_Stroke_Opacity}"></path>
            </g>
            <g>
                <circle v-for="(value,key) in nodes" :key="key" :cx="value.x" :cy="value.y" :id="'circle_'+key" :r="circle_R" 
                :style="{'fill':circle_Fill}"></circle>
                <!-- 'stroke':circle_Stroke,'strokeWidth':circle_Stroke_Width -->
            </g>
        </svg>
    </div>
</template>

<script>
export default {
    name:'ForceNet',
    props:{
        nodes:{
            default:()=>{}
        },
        links:{
            default:()=>[]
        },
        attrData:{
            default:()=>[]
        }
    },
    data(){
        return {
            circle_Fill:"#48A6EA",
            circle_R:2,
            circle_Stroke_Width:1,
            circle_Stroke:'steelblue',
            line_Fill:"none",
            line_Stroke:"#ccc",
            line_Stroke_Opacity:.5,
            line_stroke_Width:1,
            attributions:[],//["year","country","people","tech","count"],
            classCounts:[],//选择的属性分的类别
            chooseColor:[],//属性分类颜色
            chooseAttrIndex:0,
            attrClassData:[],//选择属性后那些点属于哪一类
        }
    },
    computed:{
        getAttributions(){
            return this.$store.getters.getAttributions;
        }
    },
    methods:{
        changeBtnColor(index){
            this.chooseAttrIndex=index;
            var event = window.event||arguments[0];
            this.attrClassData=[];
            for(let i=0;i<this.classCounts[index];i++){
                this.attrClassData.push([]);
            }
            //类别判断 这些点分别属于选择的属性的哪一个分类
            if(this.$store.getters.getFile=="zhuanli"){
                if(index==0){
                    for(let i=0;i<this.attrData.length;i++){
                        
                        if(parseInt(this.attrData[i].attr[this.attributions[index]])<1975){
                            this.attrClassData[0].push(this.attrData[i].name);
                        }
                        else if(parseInt(this.attrData[i].attr[this.attributions[index]])>1987){
                            this.attrClassData[2].push(this.attrData[i].name);
                        }
                        else{
                            this.attrClassData[1].push(this.attrData[i].name);
                        }
                    }
                }
                else if(index==1){
                    for(let i=0;i<this.attrData.length;i++){
                        if(this.attrData[i].attr[this.attributions[index]]=='US'){
                            this.attrClassData[0].push(this.attrData[i].name);
                        }
                        else{
                            this.attrClassData[1].push(this.attrData[i].name);
                        }
                    }
                }
                else if(index==2){
                    for(let i=0;i<this.attrData.length;i++){
                        this.attrClassData=this.$d3.nest()
                        .key(function(d) { return d.attr.people; })
                        .entries(this.attrData)
                    }
                }
                else if(index==3){
                    for(let i=0;i<this.attrData.length;i++){
                        this.attrClassData=this.$d3.nest()
                        .key(function(d) { return d.attr.tech; })
                        .entries(this.attrData)
                    }
                }
                else if(index==4){
                    for(let i=0;i<this.attrData.length;i++){
                        if(parseInt(this.attrData[i].attr[this.attributions[index]])==0){
                            this.attrClassData[0].push(this.attrData[i].name);
                        }
                        else{
                            this.attrClassData[1].push(this.attrData[i].name);
                        }
                    }
                }
                
            }

            let node=event.target;
            if(event.target.localName=="span"){
                node=node.parentNode;
            }
            let nodes=node.parentNode.children;
            for(let i=0;i<nodes.length;i++){
                nodes[i].style.color="#606266";
                nodes[i].style.borderColor="#DCDFE6";
                nodes[i].style.backgroundColor="#fff";
            }
            node.style.color="#409EFF";
            node.style.borderColor="#c6e2ff";
            node.style.backgroundColor="#ecf5ff";
            this.chooseColor=[];
            for(let i=0;i<this.classCounts[index];i++){
                this.chooseColor.push(this.circle_Fill);
            }

        },
        //匹配规则
        changeEvent(attrIndex,classIndex){
            if(this.attrClassData[classIndex].key){
                let data=this.attrClassData[classIndex].values;
                for(let i=0;i<data.length;i++){
                    this.$d3.select("#circle_"+data[i].name).style("fill",this.chooseColor[classIndex]);
                }
            }
            else{
                let data=this.attrClassData[classIndex];
                for(let i=0;i<data.length;i++){
                    this.$d3.select("#circle_"+data[i]).style("fill",this.chooseColor[classIndex]);
                }
            }
        }
    },
    watch:{
        getAttributions:function(){
            this.attributions=this.getAttributions;
        },
        attrData:function(){
            if(this.$store.getters.getFile=="zhuanli"){
                let people=[];
                let tech=[];
                for(let i=0;i<this.attrData.length;i++){
                    people.push(this.attrData[i].attr['people']);
                    tech.push(this.attrData[i].attr['tech']);
                }
                people=Array.from(new Set(people));
                tech=Array.from(new Set(tech));
                this.classCounts=[];
                this.classCounts=[3,2,people.length,tech.length,2];
            }
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
.el-button:active {
    color: #409EFF;
    border-color: #c6e2ff;
    background-color: #ecf5ff
}
.el-button-group{
    position: absolute;
    top:10px;
    right:10px;
}
.colorPanel{
    position: absolute;
    top:50px;
    right:10px;
}
.colorItem span{
    position: relative;
    top:-10px;
    font-size: 10px;
    margin-right:10px;
}
</style>