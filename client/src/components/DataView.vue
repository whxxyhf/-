<template>
    <div class="box">
        <div class="content">
            <div class="file">DataSet:<input type="text" class="fileinput"><input type="button" value="Browser" class="filebtn"></div>
            <el-table
                :data="tableData"
                stripe
                style="width: 100%;margin-top:5px" size="mini" border>
                <el-table-column
                prop="nodesCount"
                label="Nodes"
                width="100%" align="center" header-align="center">
                </el-table-column>
                <el-table-column
                prop="tsneNodesCount"
                label="TsneCount"
                width="100%" align="center" header-align="center">
                </el-table-column>
                <el-table-column
                prop="linksCount"
                label="Edges" align="center" header-align="center">
                </el-table-column>
            </el-table>
            <!-- <p>Nodes:<span v-cloak>{{nodesCount}}</span></p>
            <p>TsneNodesCount:<span v-cloak>{{tsneNodesCount}}</span></p>
            <p>Edges:<span v-cloak>{{linksCount}}</span></p> -->
        </div>
    </div>
</template>

<script>
export default {
    name:'DataView',
    data(){
        return {
            tableData: [{
            nodesCount: 0,
            tsneNodesCount: 0,
            linksCount: 0
            }, ]
        }
    },
    methods:{
        //请求原始边的数量
        getLinksCount(){
            this.$axios.post('http://localhost:5000/link/findCount',{
                file:this.$store.getters.getFile,
            })
            .then((res)=>{
                this.tableData[0].linksCount=res.data.data;
            })
        },
        //请求原始点的数量
        getNodesCount(){
            this.$axios.post('http://localhost:5000/force/findNodeCount',{
                file:this.$store.getters.getFile,
            })
            .then((res)=>{
                this.tableData[0].nodesCount=res.data.data;
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
                this.tableData[0].tsneNodesCount=res.data.data;
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
    font-size: 16px;
    margin-top:5px;
}
.fileinput{
    margin-left:5px;
}
.filebtn{
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
    height:23px;
}

</style>
<style>
tr{
    padding: 3px 0;
    font-size: 12px;
    color:black;
}
.el-table--mini td, .el-table--mini th{
    padding: 3px 0 !important;
    color:black;
}
.el-table td, .el-table th{
    padding: 0 0;
}
</style>
