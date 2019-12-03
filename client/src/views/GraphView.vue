<template>
    <div class="box">
    
        <!-- left盒子 -->
        <div class="left">

            <Panel :title="'Data Infomation'" :panelHeight="'20%'" :panelWidth="'100%'" :titleHeight="titleHeight" style="float:left;">
                <DataView slot="panelBody"/>
            </Panel>
            
            <!-- 控制面板 -->
            <Panel :title="'Control Panel'" :panelHeight="'30%'" :panelWidth="'100%'" :titleHeight="titleHeight" style="float:left;">
                <ControlPanel slot="panelBody"/>
            </Panel>
            
            <!-- 分割树图 -->
            <Panel :title="'Tree View'" :panelHeight="'50%'" :panelWidth="'100%'" :titleHeight="titleHeight" style="float:left;">
                <Tree :tree="tree" :chooseNode="getClassNames" slot="panelBody"/>
            </Panel>
            
        </div>

        <!--middle盒子-->
        <div class="middle">
            <!-- 聚类力导图 -->
            <Panel :title="'Node-Link View'" ref="forcePanel" :panelHeight="'100%'" :panelWidth="'100%'" :titleHeight="titleHeight" style="float:left;" >
                <ForceClass v-show="showType==1" :showType="showType" slot="panelBody"/>
                <ForceNet v-show="showType==0" :nodes="nodes" :links="links" slot="panelBody"/>
                <select v-model="showType" slot="title" style="float:right">
                    <option value="0">Original ForceLayout</option>
                    <option value="1">Mixed ForceLayout</option>
                </select>
            </Panel>
        </div>

        <!-- right盒子 -->
        <div class="right">
            <!-- 散点图 -->
            <Panel :title="'Projection View'" :panelHeight="'50%'" :panelWidth="'100%'" :titleHeight="titleHeight" style="float:left;" ref="tsnePanel">
                <Tsne :nodes="getTsne" :chooseClass="getClassNames" slot="panelBody"/>
                <select v-model="walkMethod" @change="chooseWalkMethod" slot="title" style="float:right">
                    <option value="no">AENRL</option>
                    <option value="deepwalk">DW</option>
                    <option value="merge">AAGE</option>
                </select>
            </Panel>

            <!-- 平行坐标图 -->
            <Panel :title="'Parallel View'" :panelHeight="'50%'" :panelWidth="'100%'" :titleHeight="titleHeight" style="float:left;">
                <Parallel slot="panelBody"/>
            </Panel>
        </div>

    </div>
</template>

<script>
import ForceNet from '../components/ForceNet';
import Tsne from '../components/Tsne';
import Tree from '../components/Tree';
import ForceClass from '../components/ForceClass';
import ControlPanel from '../components/ControlPanel';
import Parallel from '../components/Parallel';
import DataView from '../components/DataView';
import {mapActions,mapGetters} from 'vuex';
export default {
    name:'GraphView',
    components:{
        ForceNet,
        Tsne,
        Tree,
        ForceClass,
        ControlPanel,
        Parallel,
        DataView,
    },
    data(){
        return {
            titleHeight:this.$store.state.titleHeight,
            walkMethod:"no",
            showType:0,//显示力导图类型
            nodes:{},//储存原始网络力导图点坐标数据
            links:[],//储存原始网络力链接数据
            tree:[],//储存树图数据
        }
    },
    computed:{
        ...mapGetters(['getClassNames','getTsne','getType','getLabel','getFile'])
    },
    methods:{
        ...mapActions(['updateClassNames','updateTsne','updateLastClass','updateTreeRoot']),
        //请求力导向布局点的坐标数据
        getNodes(){
            this.$axios.post('http://localhost:5000/force/findAll',{
                width:this.$refs.forcePanel.$refs.root.clientWidth,
                height:this.$refs.forcePanel.$refs.root.clientHeight,
                file:this.getFile,
            })
            .then((res)=>{
                this.nodes=res.data;
            })
        },
        //请求连接数据
        getLinks(){
            this.$axios.post('http://localhost:5000/link/findAll',{
                file:this.getFile,
            })
            .then((res)=>{
                this.links=res.data;
            })
        },
        //请求tsne数据
        getTsneData(){
            this.$axios.post('http://localhost:5000/tsne/findAllLocation',{
                width:this.$refs.tsnePanel.$refs.root.clientWidth,
                height:this.$refs.tsnePanel.$refs.root.clientHeight,
                label:this.getLabel,
                type:this.getType,
                file:this.getFile,
            })
            .then((res)=>{
                this.updateTsne(res.data);
            })
        },
        //请求分割树数据
        getTree(){
            this.$axios.post('http://localhost:5000/tree/findTree',{
                label:this.getLabel,
                type:this.getType,
                file:this.getFile,
            })
            .then((res)=>{
                let names=[];
                this.$store.dispatch('updateCutFlag',true);
                this.getChildren(res.data,0,3,names);
                this.updateClassNames(names);
                let tree=res.data;
                // this.modifyTreeName(res.data);
                this.tree=tree;
                this.updateTreeRoot(res.data);
                // console.log(this.getTreeCount(res.data))
            })
        },
        getTreeCount(node){
            let index=1;
            if(node.ifsan==0){
                for(let i=0;i<node.children.length;i++){
                    index+=this.getTreeCount(node.children[i]);
                }
                
                return index;
            }
            else{
                return index;
            }
        },
        modifyTreeName(node){
            node.name="class"+node.name;
            if(node.children){
                for(let i=0;i<node.children.length;i++){
                    this.modifyTreeName(node.children[i]);
                }
            }
        },
        // 请求默认深度的树节点名称（className）
        getChildren(node,deep,maxDeep,names){
            deep+=1
            if(deep==maxDeep){
                for(let i=0;i<node.children.length;i++){
                    names.push(node.children[i]);
                }
            }
            else{
                for(let i=0;i<node.children.length;i++){
                    this.getChildren(node.children[i],deep,maxDeep,names);
                }
            }
        },
        //选择游走方式
        chooseWalkMethod(){
            this.$store.dispatch("updateType",this.walkMethod);
        },
    },
    mounted(){
        this.getNodes();
        this.getTsneData();
        this.getTree();
    },
    watch:{
        // 等力布局点的坐标获得后再获得链接数据
        nodes:function(){
            this.getLinks();
        },
        getLabel:function(){
            this.updateLastClass([]);
            this.updateClassNames([]);
            this.getTsneData();
            this.getTree();
        },
        getType:function(){
            this.updateLastClass([]);
            this.updateClassNames([]);
            this.getTsneData();
            this.getTree();
        }
        //type 或者label发生变化需要做的事情
            //重新获取tsneData,treeData
            //清空classNames并重新默认一层
            //清空上一次选择的层
    }
}
</script>
<style scoped>
.box{
    width:100%;
    height:100%;
}
.left{
    width:25%;
    height:100%;
    float:left;
}
.middle{
    width:50%;
    height:100%;
    float:left;
}
.right{
    width:25%;
    height:100%;
    float:left;
}

</style>