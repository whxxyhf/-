import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Panel from './components/Panel'
import axios from 'axios'
import * as d3 from 'd3'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(Panel);
Vue.use(ElementUI);
Vue.prototype.$axios=axios;
Vue.prototype.$d3=d3;

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
