
const getters={
    //获得选择的分类名
    getClassNames:state=>state.classNames,
    //获得tsne点的坐标（字典形式）
    getTsne:state=>state.tsne,
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
};
export default getters;