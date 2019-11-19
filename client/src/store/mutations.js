const mutations={
    //设置选择的类名称
    setClassNames:(state,names)=>(state.classNames=names),
    //设置tsne数据
    setTsne:(state,tsne)=>(state.tsne=tsne),
    //设置选择的属性
    setLabel:(state,label)=>(state.label=label),
    //设置游走的类型
    setType:(state,type)=>(state.type=type),
    //设置上次选择的层次
    setLastClass:(state,lastClass)=>(state.lastClass=lastClass),
    //设置选中类包含的点
    setContainNodes:(state,ids)=>(state.containNodes=ids),
    //设置力导图展示类型
    setForceType:(state,type)=>(state.forceType=type),
};
export default mutations;