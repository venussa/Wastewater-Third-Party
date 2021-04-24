<!-- eslint-disable-->
<template>
    <div style="background: #00bb8a; height: 100%">
      <b-col md="12" class="header" style="position: relative; z-index: 999">
        <p style="margin-top: 10px;">Wastewater Monitoring</p>
        <img class="d-none d-sm-block" :src="require('@/assets/images/logo/logo.png')">
      </b-col>
      <div class="col-md-12" style="text-align: center; color: #fff; margin-top: 30px;position: relative; z-index: 999">
          <div><div style="display: inline-block"><i class="solar-icon" /></div></div>
          <p style="font-size: 27px; font-weight: 600;margin-top: 30px;">Wastewater Monitoring</p>
          <p style="font-size: 19px;">See your building's Wastewater consumption!</p>
          <p>Application made by Peaple Hearts</p>
          <b-link :to="{ name: 'node' }" class="btn btn-primary btn-white">Display Nodes</b-link>
          <p style="padding: 10px; font-size: 10px">
            <b-link style="color:#fff" v-b-modal.modal-primary>
              <feather-icon icon="KeyIcon" />
              Change API Keys
            </b-link>
          </p>
      </div>
      <img
        :src="require('@/assets/images/background/wave.png')"
        style="position: absolute; bottom: 0px; left:0px; width: 100%; z-index: 998"
        onmousedown="event.preventDefault ? event.preventDefault() : event.returnValue = false"
      >

      <b-modal
        id="modal-primary"
        modal-class="modal-primary"
        ok-title="Save Changes"
        @ok="changeAPI"
        centered
        title="Data Validation"
      >
        <div>
          <strong>Username</strong>
          <input type="text" v-model="username" class="form-control" style="margin-bottom: 10px" />
          <strong>Password</strong>
          <input type="password" v-model="password" class="form-control" style="margin-bottom: 10px" />
          <strong>API Key</strong>
          <input type="text" v-model="api_key" class="form-control" style="margin-bottom: 10px"/>
          <p style="color: #ff0000">{{ error }}</p>
        </div>
      </b-modal>
    </div>
</template>

<script>

import {
  BCol,
  BLink,
  BModal,
  VBModal,
} from 'bootstrap-vue'
import FeatherIcon from '@/@core/components/feather-icon/FeatherIcon.vue'
import axios from 'axios'
import httpApi from '@/main'

export default {
  components: {
    BCol,
    BLink,
    BModal,
    FeatherIcon,
  },
  directives: {
    'b-modal': VBModal,
  },
  data() {
    return {
      api: [],
      username: '',
      password: '',
      error: '',
      auth_key: '',
      api_key: '',
    }
  },
  methods: {
    changeAPI(event) {
      this.checkUser()
      event.preventDefault()
    },
    // check user exist
    checkUser() {
      const formData = new FormData()
      formData.append('username', `${this.username}`)
      formData.append('password', `${this.password}`)

      const http = axios.post(`${httpApi.host}/login`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      http.then(response => {
        this.api = response.data
      })

      http.catch(response => {
        if (response.response.status === 401) {
          this.error = 'Invalid Data'
        }
      })

      http.finally(() => {
        this.auth_key = `Bearer ${this.api.access_token}`
        this.checkProject()
      })
    },
    // check project exist
    checkProject() {
      const http = axios.get(`${httpApi.host}/project`, {
        headers: {
          Authorization: this.auth_key,
        },
      })

      http.then(response => {
        this.api = response.data
      })

      http.finally(() => {
        const result = this.api.data
        let status = 0
        for (let x = 0; x < result.length; x += 1) {
          if (this.api_key === result[x].api_key) {
            status = 1
            break
          }
        }
        if (status === 1) {
          sessionStorage.setItem('set_api', this.api_key)
          sessionStorage.setItem('username', this.username)
          sessionStorage.setItem('password', this.password)
          sessionStorage.setItem('token', this.auth_key)
          this.error = ''
          window.location = '/node'
        } else {
          this.error = 'Invalid Data'
        }
      })
    },
  },
}
</script>

<style lang="scss">
@import '@core/scss/vue/libs/vue-select.scss';
@import '@/assets/scss/home.scss';
</style>
