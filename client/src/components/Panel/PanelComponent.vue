<template>
    <div class="panel" :style="{'height':panelHeight,'width':panelWidth}" >
        <div class="panelPadding">
            <div class="title" :style="{'height':titleHeight+'px'}">
                {{title}}
                <slot name="title"></slot>
            </div>
            <div class="panelBody" :style="{'height':'calc(100%' +' - '+ titleHeight+'px)'} " ref="root">
                <slot name="panelBody"></slot>
            </div>
        </div>
    </div>
    
</template>

<script>
export default {
    name:'PanelComponent',
    props:['title','panelHeight','panelWidth','titleHeight'],
    
}
</script>

<style scoped>
.panelPadding{
    width:100%;
    height:100%;
    box-sizing: border-box;
    padding: 0 5px 5px 0;
}
.title{
    width:100%;
    background-color: #409EFF;
    /* background: #3072ad; */
    /* border:1px solid #ebebeb; */
    font-weight: bold;
    box-sizing: border-box;
    border: 1px solid #409EFF;
    text-indent:10px;
    color:white;
    font-size: 0.8rem;
    line-height: 130%;
}
.panelBody{
    width:100%;
    position: relative;
    box-sizing: border-box;
    border: 1px solid #409EFF;
}
</style>