<template>
    <div class="box">
        <svg style="width:100%;height:100%;">
            <g>
                <path v-for="(value,index) in links" :key="index" :d="'M'+nodes[value.source].x+' '+nodes[value.source].y
                +' L'+nodes[value.target].x+' '+nodes[value.target].y" :style="{'fill':line_Fill,'stroke':line_Stroke,
                'strokeWidth':line_stroke_Width,'strokeOpacity':line_Stroke_Opacity}"></path>
            </g>
            <g>
                <circle v-for="(value,key) in nodes" :key="key" :cx="value.x" :cy="value.y" :id="'circle_'+key" :r="circle_R" 
                :style="{'fill':circle_Fill,'stroke':circle_Stroke,'strokeWidth':circle_Stroke_Width}"></circle>
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
        }
    },
    data(){
        return {
            circle_Fill:"#fff",
            circle_R:2,
            circle_Stroke_Width:1,
            circle_Stroke:'steelblue',
            line_Fill:"none",
            line_Stroke:"#ccc",
            line_Stroke_Opacity:.5,
            line_stroke_Width:1,
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
</style>