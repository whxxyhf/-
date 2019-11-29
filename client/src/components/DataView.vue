<template>
    <div class="box">
        <div class="content">
            <p>Nodes:<span v-cloak>{{nodesCount}}</span></p>
            <p>TsneNodesCount:<span v-cloak>{{tsneNodesCount}}</span></p>
            <p>Edges:<span v-cloak>{{linksCount}}</span></p>
        </div>
    </div>
</template>

<script>
export default {
    name:'DataView',
    data(){
        return {
            nodesCount:0,
            tsneNodesCount:0,
            linksCount:0,
        }
    },
    methods:{
        //请求原始边的数量
        getLinksCount(){
            this.$axios.post('http://localhost:5000/link/findCount',{
                file:this.$store.getters.getFile,
            })
            .then((res)=>{
                this.linksCount=res.data.data;
            })
        },
        //请求原始点的数量
        getNodesCount(){
            this.$axios.post('http://localhost:5000/force/findNodeCount',{
                file:this.$store.getters.getFile,
            })
            .then((res)=>{
                this.nodesCount=res.data.data;
            })
        },
        //请求tsne数据
        getTsneNodesCount(){
            this.$axios.post('http://localhost:5000/tsne/findCount',{
                label:this.$store.getters.getLabel,
                type:this.$store.getters.getType,
                file:this.$store.getters.getFile,
            })
            .then((res)=>{
                this.tsneNodesCount=res.data.data;
            })
        },
    },
    mounted(){
        this.getLinksCount();
        this.getNodesCount();
        this.getTsneNodesCount();
    }
}
</script>

<style scoped>
.box{
    width:100%;
    height: 100%;
    position: relative;
}
.content{
    width:100%;
    height:100%;
    box-sizing: border-box;
    padding: 5px 5px;
}
p{
    font-size: 12px;
}
</style>
