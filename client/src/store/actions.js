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
    updateForceType({commit},type){
        commit('setForceType',type);
    },
    updateClickClass({commit},clickClass){
        commit('setClickClass',clickClass);
    }
};
export default actions;