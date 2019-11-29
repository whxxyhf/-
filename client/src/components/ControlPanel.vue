<template>
    <div class="box">
        <!-- 数据介绍 -->
        <!-- <div class="info">
            <div class="content">
                <p>Nodes:<span></span></p>
                <p>Edges:<span></span></p>
            </div>
        </div> -->

        <!--属性选择-->
        <div class="attr">
            <div class="titleParameLeft">Model Parameter</div>
            <div class="titleParameRight">Attributions Selected</div>
            <div class="left">
                <div class="sliderBox">
                    <div class="parameterName">TS:</div>
                    <el-slider v-model="trainStep" :show-tooltip="false" class="sliderStyle" 
                    :max='10' :min='1' :step="1" show-input :show-input-controls="false" :input-size="'mini'" :key="1"></el-slider>
                </div>
                <div class="sliderBox">
                    <div class="parameterName">JR:</div>
                    <el-slider v-model="jumpRate" :show-tooltip="false" class="sliderStyle" 
                    :max='0.9' :min='0.1' :step="0.1" show-input :show-input-controls="false" :input-size="'mini'" :key="2"></el-slider>
                </div>
                <div class="sliderBox">
                    <div class="parameterName">WL:</div>
                    <el-slider v-model="walkEpochs" :show-tooltip="false" class="sliderStyle" 
                    :max='10' :min='1' :step="1" show-input :show-input-controls="false" :input-size="'mini'" :key="3"></el-slider>
                </div>
                <input type="button" value="Confirm" @click="updateType" class="confirm" id="confirm1">
            </div>

            <div class="right">
                <el-checkbox-group v-model="initAtrrrs" :id="'input_'+index"  style="margin:0 10%"
                v-for="(value,index) in attributions" :key="index" :fill="color[index]" :text-color="color[index]">
                    <el-checkbox :label="value" @change="updateTypeOne(index)">{{value}}</el-checkbox><br/>
                    <!-- <div style="height:2px;width:100%;"></div> -->
                </el-checkbox-group>
                <!-- <el-button size="mini" @click="updateType">OK</el-button> -->
                <input type="button" value="Confirm" @click="updateType" class="confirm" id="confirm">
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name:'ControlPanel',
    data(){
        return {
            //初始选择的属性
            initAtrrrs:[],
            //所有的属性
            attributions:["year","country","people","tech","count"],
            color:["#FF3030","#FF00FF","#C0FF3E","#87CEFA","#FFC0CB"],
            label:[],
            trainStep:5,
            jumpRate:0.5,
            walkEpochs:5,
        }
    },
    methods:{
        updateTypeOne(index){
            var event = window.event||arguments[0];
            if(event.target.checked){
                this.label[index]='T';
            }
            else{
                this.label[index]='F';
            }
        },
        updateType(){
            this.$store.dispatch("updateLabel",this.label.join().replace(/,/g,''));
        }
    },
    mounted(){
        //加载初始label
        this.label=this.$store.state.label.split("");
        for(let i=0;i<this.label.length;i++){
            if(this.label[i]=="T"){
                this.initAtrrrs.push(this.attributions[i]);
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
.info{
    width:100%;
    height:40%;
    box-sizing: border-box;
    padding:5px 5px;
}
.content{
    width:100%;
    height:100%;
    /* background-color: #cccccc; */
    box-sizing: border-box;
    border:0.5px solid #409EFF;
    font-size: 12px;
}
.attr{
    width:100%;
    height:100%;
    box-sizing: border-box;
    padding:5px 5px;
}
.left{
    width:50%;
    height:85%;
    float:left;
    box-sizing: border-box;
    border:0.5px solid #409EFF;
    padding: 5px 5px;
}
.right{
    width:calc(50% - 5px);
    height:85%;
    float:left;
    box-sizing: border-box;
    border:0.5px solid #409EFF;
    padding: 5px 5px;
    margin-left:5px;
}
.sliderBox{
    width:100%;
    height:25%;
}
.parameterName{
    width:10%;
    float:left;
    font-size: 12px;
    position: relative;
    top:12px;
    /* text-indent:10px; */
}
.sliderStyle{
    width:80%;
    float:right;
    margin:0 5px;
    height:20px;
}
.titleParameLeft{
    width:50%;
    height:15%;
    float:left;
    background:cornflowerblue;
    font-size: 12px;
    line-height: 1;
    box-sizing: border-box;
    border:0.5px solid #409EFF;
    padding: 5px 5px;
    font-weight: 700;
}
.titleParameRight{
    background:cornflowerblue;
    font-size: 12px;
    line-height: 1;
    width:calc(50% - 5px);
    height:15%;
    float:left;
    box-sizing: border-box;
    border:0.5px solid #409EFF;
    padding: 5px 5px;
    margin-left:5px;
    font-weight: 700;
}
.confirm{
    display: inline-block;
    width:98%;
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
#confirm1{
    margin-top:7px;
}
/* /deep/ .el-checkbox__input.is-checked .el-checkbox__inner {
background-color: #fff;
border-color: #fdb122;
background: #fdb122;
}
/deep/ .el-checkbox__input.is-checked+.el-checkbox__label{
    color:black;
} */
</style>
<style scoped>
/deep/ #input_0 .el-checkbox__input.is-checked .el-checkbox__inner {
background-color: #fff;
border-color: #FF3030;
background: #FF3030;
}
/deep/ #input_0 .el-checkbox__input .el-checkbox__inner {
background-color: #fff;
border-color: #FF3030;
background: #FF3030;
}
/deep/ #input_0 .el-checkbox__input.is-checked+.el-checkbox__label{
    color:#000000;
}
/deep/ #input_0 .el-checkbox__input+.el-checkbox__label{
    margin-left:20px;
}


/deep/ #input_1 .el-checkbox__input.is-checked .el-checkbox__inner {
background-color: #fff;
border-color: #FF00FF;
background: #FF00FF;
}
/deep/ #input_1 .el-checkbox__input .el-checkbox__inner {
background-color: #fff;
border-color: #FF00FF;
background: #FF00FF;
}
/deep/ #input_1 .el-checkbox__input.is-checked+.el-checkbox__label{
    color:#000000;
}
/deep/ #input_1 .el-checkbox__input+.el-checkbox__label{
    margin-left:20px;
}


/deep/ #input_2 .el-checkbox__input.is-checked .el-checkbox__inner {
background-color: #fff;
border-color: #C0FF3E;
background: #C0FF3E;
}
/deep/ #input_2 .el-checkbox__input .el-checkbox__inner {
background-color: #fff;
border-color: #C0FF3E;
background: #C0FF3E;
}
/deep/ #input_2 .el-checkbox__input.is-checked+.el-checkbox__label{
    color:#000;
}
/deep/ #input_2 .el-checkbox__input+.el-checkbox__label{
    margin-left:20px;
}

/deep/ #input_3 .el-checkbox__input.is-checked .el-checkbox__inner {
background-color: #fff;
border-color: #87CEFA;
background: #87CEFA;
}
/deep/ #input_3 .el-checkbox__input .el-checkbox__inner {
background-color: #fff;
border-color: #87CEFA;
background: #87CEFA;
}
/deep/ #input_3 .el-checkbox__input.is-checked+.el-checkbox__label{
    color:#000;
}
/deep/ #input_3 .el-checkbox__input+.el-checkbox__label{
    margin-left:20px;
}


/deep/ #input_4 .el-checkbox__input.is-checked .el-checkbox__inner {
background-color: #fff;
border-color: #ffc0cb;
background: #FFC0CB;
}
/deep/ #input_4 .el-checkbox__input .el-checkbox__inner {
background-color: #fff;
border-color: #ffc0cb;
background: #FFC0CB;
}
/deep/ #input_4 .el-checkbox__input.is-checked+.el-checkbox__label{
    color:#000;
}
/deep/ #input_4 .el-checkbox__input+.el-checkbox__label{
    margin-left:20px;
}

</style>

<style>
.el-slider__input {
    float: right;
    /* margin-top: 3px; */
    width: 40px !important;
    margin-right:5px;
}
.el-input-number.is-without-controls .el-input__inner{
    padding: 2px 2px 2px 2px!important;
}
.el-input--mini .el-input__inner {
    height: 20px;
    line-height: 20px;
}
.el-slider__button{
    width:12px!important;
    height:12px!important;
}
.el-slider__runway {
    margin-right: 50px !important;
    width: auto;
}
</style>