const state={
    //title的高度
    titleHeight:20,
    //选择某一层的类名
    classNames:[],
    //tsne点的坐标
    tsne:{},
    //选择的文件
    file:"zhuanli",
    //数据属性名称
    attributions:[],
    //选择的属性
    label:"FFTFF",
    //游走类型
    type:"no",
    //保留上一次选择的层次
    lastClass:[],
    //力导图展示的类型，默认为花瓣图
    forceType:"pie",
    //当前点击的类
    clickClass:{},
    //选择的某一层中属于最底层的类
    bottomClass:[],
    //选择的某一层中不属于最底层的类
    notBottomClass:[],
    //树的根
    treeRoot:{},
    //是否布局的标志
    cutFlag:true,
};
export default state;