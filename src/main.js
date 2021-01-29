import Vue from 'vue'
import App from './App.vue'
import './assets/styles/common.scss'
import './mobileUtils'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
