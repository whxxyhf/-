
const getters={
    //获得选择的分类名
    getClassNames:state=>state.classNames,
    //获得tsne点的坐标（字典形式）
    getTsne:state=>state.tsne,
    //获得选择的文件
    getFile:state=>state.file,
    //获得选择的属性
    getLabel:state=>state.label,
    //获得游走类型
    getType:state=>state.type,
    //获得上一次选择的层次
    getLastClass:state=>state.lastClass,
    //获得当前导图展示类型
    getForceType:state=>state.forceType,
    //获得当前点击的类
    getClickClass:state=>state.clickClass,
    //获得选择的某一层中属于最底层的类
    getBottomClass:state=>state.bottomClass,
    //获得选择的某一层中不属于最底层的类
    getNotBottomClass:state=>state.notBottomClass,
    //获得树的根
    getTreeRoot:state=>state.treeRoot,
    //获得是否布局
    getCutFlag:state=>state.cutFlag,
};
export default getters;