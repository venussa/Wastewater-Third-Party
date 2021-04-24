import moment from 'moment-timezone'
import Vue from 'vue'
import axios from 'axios'
import VueSimpleAlert from 'vue-simple-alert'
import router from './router'
import App from './index.vue'
import './components'

Vue.use(VueSimpleAlert)

moment.tz.setDefault('Asia/Jakarta')
Vue.prototype.$moment = moment

// Feather font icon - For form-wizard
require('@core/assets/fonts/feather/iconfont.css')

// import core styles
require('@core/scss/core.scss')

// import assets styles
require('@/assets/scss/style.scss')

// set default http access api
const httpApi = {
  host: 'http://103.212.239.10:8000/api',
  user: (sessionStorage.getItem('username'), // username
  pass: (sessionStorage.getItem('password'), // password
  ApiKey: (sessionStorage.getItem('set_api'), // 2b509df33d
}

Vue.prototype.$api = httpApi
export default httpApi

// generate access token
if (sessionStorage.getItem('token') === null) {
  let api = []
  const formData = new FormData()
  formData.append('username', `${httpApi.user}`)
  formData.append('password', `${httpApi.pass}`)

  const http = axios.post(`${httpApi.host}/login`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  http.then(response => {
    api = response.data
  })

  http.finally(() => {
    // save token to session storage
    sessionStorage.setItem('token', `Bearer ${api.access_token}`)
    sessionStorage.setItem('id', api.data.id)
    window.location.reload()
  })
}

// set router
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
