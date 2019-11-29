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
