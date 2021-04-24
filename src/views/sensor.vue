<!-- eslint-disable-->
<template>
    <div>
      <b-container class="container">
        <b-row>
        <b-col md="10" offset-md="1">
          <div style="margin-bottom: 20px">
            <feather-icon icon="HomeIcon" color="#00bb8a" size="18" style="position: absolute" />
            <p style="margin-left: 20px;">
              <b-link :to="{ name: 'home' }">Home</b-link> / 
              <b-link :to="{ name: 'node' }">Node List</b-link> / 
              Sensor List
            </p>
          </div>
          <b-card class="box" style="min-height: 1000px">
            <b-row>
              <!-- title -->
              <h1 class="page-title">Sensor List</h1>
              <div class="col-md-6" />
              <div class="col-md-6" style="text-align: right; padding-right:0px;color: #fff">
                Search: 
                <input v-model="filter" class="form-control" style="width: 200px; display: inline-block; margin-left: 10px;" placeholder="keyword ..." @input="search" />
              </div>
              <div class="col-md-12" style="height: 20px" />
              <!-- datatable -->
              <b-col md="9">
                <b-row>
                  <div v-for="data in items" class="col-md-6" style="margin-bottom: -40px">
                    <b-link :to="{ name: 'detail', params: {'n_id': data.node_id, 's_id': data.id }}" style="padding: 0px">
                      <b-card style="position: relative; height: 150px">
                        <h2 style="font-weight: 600; font-size: 22px">{{ data.name }}</h2>
                        <p style="color: #666;">{{ data.description === null ? 'No Description' : data.description }}</p>
                        <p style="color: #666;font-size: 12px;position: absolute; left: 20px; bottom: 10px;">Data Type : {{ data.data_type }}</p>
                        <p style="color: #666;font-size: 12px;position: absolute; right: 10px; bottom: 10px;">{{ data.created_at }}</p>
                        <div :class="`alert ${data.sensor_status === 'up' ? 'alert-primary' : 'alert-danger'} circle`" style="position: absolute; right: 30px; top: 30px;">
                          <feather-icon :icon="data.sensor_status === 'up' ? 'CheckCircleIcon' : 'AlertTriangleIcon'" size="30" />
                        </div>
                      </b-card>
                    </b-link>
                  </div>
                </b-row>
              </b-col>
              <b-col md="3" style="position: relative">
                <i class="leaf-icon" style="position: absolute; bottom: 20%; left: 20%" />
              </b-col>
            </b-row>
          </b-card>

        </b-col>
        </b-row>
      </b-container>
    </div>
</template>

<script>

import {
  BContainer,
  BCol,
  BRow,
  BCard,
  BLink,
} from 'bootstrap-vue'

import axios from 'axios'
import httpApi from '@/main'
import FeatherIcon from '@/@core/components/feather-icon/FeatherIcon.vue'

export default {
  components: {
    BCol,
    BRow,
    BContainer,
    BCard,
    FeatherIcon,
    BLink,
  },
  data() {
    return {
      // axios response storage
      api: [], // api storage untuk menyimpan data axios response sensor detail
      apikey: httpApi.ApiKey, // data api key
      tmpdata: [],
      fixdata: [],

      // konfigurasi table
      option_perpage: [10, 20, 50, 100],
      Deselect: {
        render: createElement => createElement('span', ''),
      },
      OpenIndicator: {
        render: createElement => createElement('span', { class: 'dropdown-icon' }),
      },

      // table field data
      fields: [
        { key: 'id', label: 'Id', sortable: true },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'description', label: 'Description', sortable: true },
        { key: 'api_key', label: 'API Key', sortable: true },
        { key: 'action', label: 'Action' },
      ],

      // table value
      items: [], // item storage untuk list data pada table
      first_entries: 0,
      last_entries: 0,
      filter: '',

      // pagination setting
      selected: 'right', // mengatur posisi penomoran halaman
      currentPage: 1, // halaman aktif table
      perpage: 10, // jumlah data yang ditampilkan untuk tiap halaman pada table
      rows: 0, // banyaknya data yang di tampilkan pada table
    }
  },
  created() {
    const http = axios.get(`${httpApi.host}/sensor?node_id=${this.$route.params.n_id}`, {
      headers: {
        Authorization: sessionStorage.getItem('token'),
      },
    })

    http.then(response => {
      this.api = response.data
    })

    http.finally(() => {
      this.items = this.api.data
      this.rows = this.api.data.length

      for (let x = 0; x < this.rows; x += 1) {
        const convert = (Date.parse(this.items[x].created_at) / 1000) + (3600 * 7)
        const today = new Date((convert * 1000))
        const dd = String(today.getDate()).padStart(2, '0')
        const mm = String(today.getMonth() + 1).padStart(2, '0')
        const yyyy = today.getFullYear()
        const hh = today.getHours()
        const ii = today.getMinutes()
        const ss = today.getSeconds()
        const SDate = this.dateConvert(`${yyyy}-${mm}-${dd}`, 1)
        const STime = this.timeConvert(`${hh}:${ii}${ss}`, 1)
        this.items[x].created_at = `${SDate}. ${STime}`
      }
      this.fixdata = this.items
      console.log(this.items)
    })
  },
  methods: {
    // change trigger for data perpage display
    search(key) {
      const keyword = key.target.value
      if (keyword.length > 0) {
        this.tmpdata = []
        console.log(keyword)
        for (let x = 0; x < this.fixdata.length; x += 1) {
          if (this.fixdata[x].name.toLowerCase().indexOf(keyword) >= 0) {
            this.tmpdata.push(this.fixdata[x])
          }
        }
        this.items = this.tmpdata
      } else {
        this.items = this.fixdata
      }
      console.log(this.tmpdata)
    },

    // time convert from 24 H Format to 12 H Format
    timeConvert(time, type = 0) {
      let timeString = time
      const H = +timeString.substr(0, 2)
      const h = (H % 12) || 12
      const ampm = H < 12 ? 'AM' : 'PM'
      if (type === 1) {
        timeString = `${h + timeString.substr(2, 3)} ${ampm}`
      } else {
        timeString = `${h + timeString.substr(0, 0)} ${ampm}`
      }
      return timeString
    },

    // konversi tanggal dari penomoran jadi penamaan
    dateConvert(data, type = 0) {
      const datename = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
      const datesplit = data.split('-')

      let month = ''
      if (type > 0) {
        month = `${datename[(parseInt(datesplit[1], 10) - 1)]} ${datesplit[2]}, ${datesplit[0]}`
      } else {
        month = `${datename[(parseInt(datesplit[1], 10) - 1)]} ${datesplit[2]}, `
      }
      return month
    },
  },
}
</script>
