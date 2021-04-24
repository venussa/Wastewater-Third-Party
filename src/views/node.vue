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
              Node List
            </p>
          </div>
          <b-card class="box" style="min-height: 1000px">
            <b-row>
              <!-- title -->
              <h1 class="page-title">Node List</h1>
              <div class="col-md-6" />
              <div class="col-md-6" style="text-align: right; padding-right:0px;color: #fff">
                Search: 
                <input v-model="filter" class="form-control" style="width: 200px; display: inline-block; margin-left: 10px;" placeholder="keyword ..." @input="search" />
              </div>
              <div class="col-md-12" style="height: 20px" />
              <!-- datatable -->
              <b-row style="width: 100%">
                <div v-for="data in items" class="col-md-3">
                  <b-card style="text-align: center">
                    <h2 style="font-weight: 600; font-size: 20px; height: 50px">{{ data.name }}</h2>
                    <p style="color: #666; height: 30px">{{ data.description === null ? 'No Description' : data.description }}</p>
                    <p style="font-size: 18px">Sensor : <strong style="color: #00bb8a">{{ sensorData[data.index] }}</strong></p>
                    <p>API Key : {{ data.api_key}}</p>
                    <b-link :to="{ name: 'sensor', params: { 'n_id': data.id }}" class="btn btn-primary">View Detail</b-link>
                  </b-card>
                </div>
              </b-row>
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
      sensorTmp: [],
      sensorData: [],
      sensorId: [],
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
    const http = axios.get(`${httpApi.host}/app/node?api_key=${httpApi.ApiKey}&with_sensors=true`, {
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
        this.items[x].index = x
        this.sensorId.push(this.items[x].id)
      }
      this.fixdata = this.items
      this.sumSensor(0, this.sensorId)
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
    // count total sensor for each node
    sumSensor(num, id) {
      const http = axios.get(`${httpApi.host}/app/node/${id[num]}?api_key=${httpApi.ApiKey}&with_sensors=true`, {
        headers: {
          Authorization: sessionStorage.getItem('token'),
        },
      })

      http.then(response => {
        this.sensorTmp = response.data
      })

      http.finally(() => {
        const sum = this.sensorTmp.data.sensors.length
        this.sensorData.push(sum)
        if (num < id.length - 1) {
          const idx = num + 1
          this.sumSensor(idx, id)
        }
      })
    },
  },
}
</script>
