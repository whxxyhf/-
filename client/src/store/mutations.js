const mutations={
    //设置选择的类名称
    setClassNames:(state,names)=>(state.classNames=names),
    //设置tsne数据
    setTsne:(state,tsne)=>(state.tsne=tsne),
    //设置选择的文件
    setFile:(state,file)=>(state.file=file),
    //设置选择的属性
    setLabel:(state,label)=>(state.label=label),
    //设置游走的类型
    setType:(state,type)=>(state.type=type),
    //设置上次选择的层次
    setLastClass:(state,lastClass)=>(state.lastClass=lastClass),
    //设置力导图展示类型
    setForceType:(state,type)=>(state.forceType=type),
    //设置点击的类
    setClickClass:(state,clickClass)=>(state.clickClass=clickClass),
    //设置选择的某一层中属于最底层的类
    setBottomClass:(state,names)=>(state.bottomClass=names),
    //设置选择的某一层中不属于最底层的类
    setNotBottomClass:(state,names)=>(state.notBottomClass=names),
    //设置树的根
    setTreeRoot:(state,root)=>(state.treeRoot=root),
};
export default mutations;