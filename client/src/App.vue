<template>
  <div id="app">
    <GraphView/>
  </div>
</template>

<script>
import GraphView from './views/GraphView'
export default {
  name:'App',
  components:{
    GraphView,
  },
  created(){
    this.$axios.post('http://localhost:5000/tsne/getAttrNames',{
                file:this.$store.getters.getFile,
            })
            .then((res)=>{
              console.log(res.data)
                this.$store.dispatch('updateAttributions',res.data);
            })
  }
}
</script>

<style>
html,body{
  width:100%;
  height:100%;
}
#app{
  width:100%;
  height: 100%;
  box-sizing: border-box;
  padding:8px 8px;
}
[v-cloak] {
  display: none;
}
</style>
