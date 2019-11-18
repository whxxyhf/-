const actions={
    updateClassNames({commit},names){
        commit('setClassNames',names);
    },
    updateTsne({commit},tsne){
        commit('setTsne',tsne);
    },
    updateLabel({commit},label){
        commit('setLabel',label);
    },
    updateType({commit},type){
        commit('setType',type);
    },
    updateLastClass({commit},lastClass){
        commit('setLastClass',lastClass);
    },
    updateContainNodes({commit},ids){
        commit('setContainNodes',ids);
    }
};
export default actions;