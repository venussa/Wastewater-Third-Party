<!-- eslint-disable-->
<template>
    <div class="page-full-background">

      <!-- header -->
      <b-col md="12" class="header">
      </b-col>
      <!-- /header -->

      <b-container class="container" v-if="api !== false">
        <b-col md="10" offset-md="1">

          <!-- navigation -->
           <div class="navigation">
            <feather-icon icon="HomeIcon" color="#fff" size="18" style="position: absolute" />
            <p>
              <b-link :to="{ name: 'home' }">Home</b-link> / 
              <b-link :to="{ name: 'node' }">Node List</b-link> / 
              <b-link :to="{ name: 'sensor', params: { 'n_id': this.$route.params.n_id }}">Sensor List</b-link> / 
              <span>Detail</span>
            </p>
          </div>
          <!-- /navigation -->

          <b-card ref="content1" class="box" style="background: #fff !important; position: relative">
            <b-row>
              <!-- sensor information detail section -->
              <div ref="iframe" style="position: absolute; right: 30px;top: 20px"></div>
              <h1 class="title-section1">{{ api.data.name }}</h1>
              <div class="col-md-2" />
              <div class="col-md-4">
                <p>Description : {{api.data.description}}</p>
                <p>Data Type : {{api.data.data_type}}</p>
                <p>Status : 
                  <b-badge v-if="lastSensor.sensor_status === 'down'" class="badges" variant="danger">Down</b-badge>
                  <b-badge v-if="lastSensor.sensor_status !== 'down'" class="badges" variant="success">Up</b-badge>
                </p>
                <p>Last Update : {{lastSensor.updated_at}}</p>
              </div>
              <div class="col-md-6">
                <p>Last Data : {{lastSensor.value}}</p>
                <p>Uptime : {{ times.uptime }}</p>
                <p>Down Time : {{ times.downtime }}</p>
                <p>Last Update : {{lastSensor.updated_at}}</p>
              </div>
              <div class="col-md-12 pdf-section">
                <b-link @click="generatePDF" class="btn btn-primary" style="cursor: pointer">
                  Export as PDF 
                  <feather-icon icon="FileTextIcon" />
                </b-link>
                <b-link :to="{name: 'print', params: { 'n_id': this.$route.params.n_id, 's_id': this.$route.params.s_id, 'ex': false }}" class="btn btn-primary" style="cursor: pointer">
                  Print 
                  <feather-icon icon="PrinterIcon" />
                </b-link>
              </div>
              <!-- / sensor information detail section -->

              <!-- sensor chart -->
              <div class="col-md-12 chart-container">
                <b-row>
                  <!-- chart heading -->
                  <div class="col-md-12 heading">
                    <b-row>
                      <div class="col-md-12">
                        <h1 class="title-section2">Line Graph</h1>
                      </div>
                      <!-- chart type filter -->
                      <div class="col-md-6">
                         <p>
                          Chart type : 
                          <select v-model="chart_types" class="form-control input-chart-type" @change="switch_chart($event)">
                            <option>Real-Time</option>
                            <option>Range</option>
                          </select>
                        </p>
                      </div>
                      <!-- chart date filter -->
                      <div class="col-md-6 input-chart-date">
                        <p style="text-align: right">
                          <flat-pickr v-model="startDate" class="form-control" :config="{ dateFormat: 'Y-m-d'}" @change="dateMatch" /> Until 
                          <flat-pickr v-model="endDate" class="form-control" :config="{ dateFormat: 'Y-m-d'}" @change="dateMatch" />
                          <span v-if="advance === true"> - 
                            <select class="form-control" v-model="lowshorting">
                              <option>Hours</option>
                              <option>Minutes</option>
                            </select>
                          </span>
                          <button class="btn btn-primary btn-filter" @click="dateFilterChart">
                            <feather-icon icon="FilterIcon" />
                          </button>
                        </p>
                      </div>
                    </b-row>
                  </div>
                  <!-- chart label -->
                  <div class="col-md-12 chart-label">
                    <b-row>
                      <p class="y"><strong>Sensor Value</strong></p>
                      <p class="x"><strong>Time Series</strong></p>
                      <!-- chart data -->
                      <div class="col-md-12" style="padding-left: 50px">
                          <app-echart-line :option-data="chart" />
                      </div>
                    </b-row>
                  </div>
                </b-row>
              </div>
              <!-- /sensor chart -->

              <!-- datatable -->
              <div class="col-md-12 datatable">
                <!-- table heading -->
                <h1 class="title-section2">Table Data</h1>
                <b-row>
                  <!-- filter table as status -->
                  <div class="col-md-6">
                    <p class="table-filter-status">
                      Filter as :
                      <b-badge variant="success" @click="status('up')">Up Status</b-badge>
                      <b-badge variant="danger" @click="status('down')">Down Status</b-badge>
                      <b-badge variant="secondary" @click="status('all')">All</b-badge>
                    </p>
                  </div>
                  <!-- filter table as date range -->
                  <div class="col-md-6">
                    <p class="table-filter-date">
                      <flat-pickr v-model="TStartDate" class="form-control" :config="{ enableTime: true,dateFormat: 'Y-m-d H:i'}" /> Until 
                      <flat-pickr v-model="TEndDate" class="form-control" :config="{ enableTime: true,dateFormat: 'Y-m-d H:i'}" />
                      <button class="btn btn-primary btn-filter" @click="dateFilterTable">
                        <feather-icon icon="FilterIcon" />
                      </button>
                    </p>
                  </div>
                </b-row>
                <!-- /table heading -->
              </div>

              <!-- table field -->
              <b-table striped hover :items="items1" :fields="fields" :current-page="currentPage" :per-page="perpage" >
                <template #cell(sensor_status)="data" aria-colspan="6" >
                  <div class="text-nowrap">
                    <p>
                      <b-badge v-if="data.item.sensor_status === 'down'" class="badges" variant="danger">Down</b-badge>
                      <b-badge v-if="data.item.sensor_status !== 'down'" class="badges" variant="success">Up</b-badge>
                    </p>
                  </div>
                </template>

                <template #cell(value)="data" aria-colspan="6" >
                  <div v-if="data !== false" class="text-nowrap">
                    <p>{{ data.item.value === null ? '0.00000' : data.item.value }}</p>
                  </div>
                </template>

              </b-table>

              <!-- trigger result for 404 data -->
              <p v-if="rows1 < 1" class="loading">
                Please Wait ...
              </p>

              <!-- pagination -->
              <div class="col-md-12" style="height:10px"></div>
              <div class="col-md-6">
                <p style="margin-top: 10px">Show {{first_entries}} to {{ last_entries }} of {{ items1.length }} entries</p>
                <p style="margin-top: -10px">Total data : {{ items1.length }}</p>
              </div>
              <b-col md="6">
                <b-pagination
                  v-model="currentPage"
                  :total-rows="items1.length"
                  base-url="#"
                  :per-page="perpage"
                  :align="selected"
                  @change="loadPage"
                />
              </b-col>
              <!-- datatable -->
            </b-row>
          </b-card>

        </b-col>
      </b-container>
    </div>
</template>

<script>

import {
  BTable, BContainer, BCol, BRow, BCard, BPagination, BBadge, BLink,
} from 'bootstrap-vue'
import axios from 'axios'
import httpApi from '@/main'
import AppEchartLine from '@core/components/charts/echart/AppEchartLine.vue'
import FeatherIcon from '@/@core/components/feather-icon/FeatherIcon.vue'
import flatPickr from 'vue-flatpickr-component'

export default {
  components: {
    BCol,
    BRow,
    BTable,
    BContainer,
    BCard,
    FeatherIcon,
    BPagination,
    BBadge,
    BLink,
    AppEchartLine,
    flatPickr,
  },
  data() {
    return {
      // menyimpan data tanggal mulai dan akhir filter pada chart
      startDate: '',
      endDate: '',
      timediff: '',

      // pengaturan pilihan filter berdasarkan jam / menit untuk range waktu 1 hari
      advance: false,
      lowshorting: 'Hours', // Hours or Minute

      // menyimpan data tanggal mulai dan akhir filter pada table
      TStartDate: '',
      TEndDate: '',
      TTimediff: '',

      // axios response storage
      apikey: httpApi.ApiKey, // data api key
      api: false, // api storage untuk menyimpan data axios response sensor detail
      lastSensor: false, // api storage untuk menyimpan data axios response last sensor

      // chart data
      chart: {
        xAxisData: [], // Horizontal Data or Chart X Curva Label
        series: [], // Vertical Data or Chart Y Curva Label
        interval: 0, // jeda waktu menampilkan label
      },
      chart_types: null,
      cStorage: false, // menyimpan data chart hasil filtering

      // table field data
      // paramater key untuk meregister nama index data
      // paramater label untuk membuat custom name untuk field title
      // sortable menampilkan tombol automatic sorting pada table field title
      fields: [
        {
          key: 'no',
          label: 'No',
          sortable: true,
          thClass: 'bg-blue',
        },
        {
          key: 'created_at',
          label: 'Update Time',
          sortable: true,
          thClass: 'bg-blue',
        },
        {
          key: 'value',
          label: 'Value',
          sortable: true,
          thClass: 'bg-blue',
        },
        {
          key: 'sensor_status',
          label: 'status',
          sortable: true,
          thClass: 'bg-blue',
        },
      ],

      // table value
      items: [], // item storage untuk list data pada chart
      items1: [], // item storage untuk list data pada table
      times: [],
      first_entries: 0,
      last_entries: 0,

      // pagination setting
      selected: 'right', // mengatur posisi penomoran halaman
      currentPage: 1, // halaman aktif table
      perpage: 10, // jumlah data yang ditampilkan untuk tiap halaman pada table
      rows: 0, // banyaknya data yang di tampilkan pada chart
      rows1: 0, // banyaknya data yang di tampilkan pada table
    }
  },
  computed: {
    render_pdf() {
      return this.$refs.iframe
    },
  },
  created() {
    // data render
    this.render()
    // HTTP AXIOS REQUEST
    const http = axios.get(`${httpApi.host}/sensor/${this.$route.params.s_id}`, {
      headers: {
        Authorization: sessionStorage.getItem('token'),
      },
    })

    // axios response
    http.then(response => {
      this.api = response.data
    })

    // axios finish data render
    http.finally(() => {
      this.last_sensor() // call last sensor data
      if (this.chart_types === 'Range') {
        this.graph_data() // call graph data
      } else {
        this.graph_data_realtime()
      }
      this.table_sensor() // call table data
    })
  },

  methods: {
    generatePDF() {
      const html = `<iframe src='/export/${this.$route.params.n_id}/${this.$route.params.s_id}' style='border: 1px transparent solid; width: 50px; height: 50px;' />`
      this.render_pdf.innerHTML = html
    },
    // Mendapatkan data terakhir atau data terupdate dari sensor yang di pilih
    last_sensor() {
      // HTTP AXIOS RESPONSE
      const http = axios.get(`${httpApi.host}/app/data/sensor/${this.$route.params.s_id}/last?api_key=${httpApi.ApiKey}`, {
        headers: {
          Authorization: sessionStorage.getItem('token'),
        },
      })

      // AXIOS RESPONSE
      http.then(response => {
        const { data } = response.data
        const toGMT = (this.strToTime(data.created_at) + (3600 * 7)) * 1000
        let timeconvert = new Date(toGMT)
        timeconvert = timeconvert.toISOString()
        data.created_at = timeconvert

        const datesource = data.created_at.split('T')
        const getdate = this.dateConvert(datesource[0], 1)
        const timesource = datesource[1].split('.')
        const gettime = this.timeConvert(`${timesource[0]}`, 1)
        data.updated_at = `${getdate} ${gettime}`
        this.lastSensor = data
      })
    },

    // melakukan permintaan data untuk menampilkan data pada table
    table_sensor() {
      // query param
      const Start = this.TStartDate.split(' ')
      const End = this.TEndDate.split(' ')
      let param = `start_date=${Start[0]}&`
      param += `start_time=${encodeURIComponent(Start[1])}&`
      param += `end_date=${End[0]}&`
      param += `end_time=${encodeURIComponent(End[1])}&`
      param += 'type=table'

      // axios request
      const http = axios.get(`${httpApi.host}/app/data/sensor/${this.$route.params.s_id}?api_key=${httpApi.ApiKey}&${param}`, {
        headers: {
          Authorization: sessionStorage.getItem('token'),
        },
      })

      // axios response
      http.then(response => {
        const { data } = response.data.data
        this.times = response.data.data
        // console.log(data)
        const limit = data
        limit.reverse()
        this.items1 = limit
        this.rows1 = this.items1.length
        const status = sessionStorage.getItem('table_status')
        const filter = status === null ? null : status
        const recap = []
        let number = 0

        for (let z = 0; z < this.rows1; z += 1) {
          const toGMT = (this.strToTime(this.items1[z].created_at) + (3600 * 7)) * 1000
          let timeconvert = new Date(toGMT)
          timeconvert = timeconvert.toISOString()
          this.items1[z].value = this.items1[z].value === null ? '0.0000' : this.items1[z].value
          this.items1[z].created_at = timeconvert
        }

        // fix invalid date range data
        if (filter !== null) {
          for (let x = 0; x < this.rows1; x += 1) {
            let datesource = this.items1[x].created_at
            datesource = datesource.split('T')
            const getdate = datesource[0]
            const timesource = datesource[1].split('.')
            const gettime = timesource[0]

            // convert date string ke timestamp
            const SD = Date.parse(`${this.TStartDate}`) / 1000
            const ED = Date.parse(`${this.TEndDate}`) / 1000
            const TS = Date.parse(getdate) / 1000
            const TLIM = parseInt((Date.now() / 1000), 10)
            const TNOW = this.strToTime(this.items1[x].created_at) - (3600 * 7)
            // memilihan batasan durasi filter
            if (TS > SD && TS <= ED && TNOW <= TLIM) {
              if (this.items1[x].sensor_status === filter || filter === 'all') {
                number += 1
                this.items1[x].no = number
                this.items1[x].created_at = `${this.dateConvert(getdate, 1)}. ${this.timeConvert(gettime, 1)}`
                recap.push(this.items1[x])
              }
            }
          }

          // renew data yanng telah di olah
          this.items1 = recap
          this.rows1 = recap.length
          this.updateState()
        }
      })
    },

    // mendapatkan data untuk di tampilkan pada chart
    graph_data() {
      // query param
      let param = `start_date=${this.startDate}&`
      param += 'start_time=00%3A00%3A01&'
      param += `end_date=${this.endDate}&`
      param += 'end_time=23%3A59%3A59&'
      // axios request
      const http = axios.get(`${httpApi.host}/app/data/sensor/${this.$route.params.s_id}?api_key=${httpApi.ApiKey}&${param}`, {
        headers: {
          Authorization: sessionStorage.getItem('token'),
        },
      })

      // axios response
      http.then(response => {
        if (typeof response.data.data === 'undefined') {
          // if the start date exceeds the end date
          this.$fire({
            title: 'Internal Server Error',
            text: 'Please reset the date range or contact administrator.',
            type: 'error',
            timer: 6000,
          })
        } else {
          // if the date is valid
          const { data } = response.data.data
          const limit = data
          console.log(limit)
          limit.reverse()
          this.items = limit
          this.rows = this.items.length

          for (let z = 0; z < this.rows; z += 1) {
            const toGMT = (this.strToTime(this.items[z].created_at) + (3600 * 7)) * 1000
            let timeconvert = new Date(toGMT)
            timeconvert = timeconvert.toISOString()
            this.items[z].created_at = timeconvert
          }

          let buildData = []

          // pemilihan jenis agregasi data
          if (this.timediff >= 3600 && this.timediff < (86400 * 7)) {
            // display 1 - 2 days
            if (this.timediff < 86400) {
              if (this.lowshorting === 'Hours') {
                // per hours
                buildData = this.displayHour()
              } else {
                // per minuter
                buildData = this.displayMinutes()
              }
            } else {
              buildData = this.displayHour()
            }
          } else if (this.timediff >= (86400 * 7) && this.timediff < (2629744 * 3)) {
            // display 3 days until 1 month
            buildData = this.displayDay()
          } else if (this.timediff >= (2629744 * 3)) {
            // display bettter than 3 months
            buildData = this.displayMonth()
          }
          this.cStorage = buildData
        }

        // checkpoint debugging
        // console.log(this.cStorage)

        // axios finish data render
        http.finally(() => {
          // menyimpan data ke chart filter storage
          for (let x = 0; x < this.cStorage.length; x += 1) {
            if (x === 0) {
              this.chart.xAxisData.push('')
              this.chart.series.push(`${this.cStorage[x][1]}`)
            }
            this.chart.xAxisData.push(`${this.cStorage[x][0]}`)
            this.chart.series.push(`${this.cStorage[x][1]}`)
          }
        })
      })
    },
    // mendapatkan data untuk di tampilkan pada chart realtime
    graph_data_realtime(num = false) {
      // query param
      let param = `start_date=${this.getTime()}&`
      param += 'start_time=00%3A00%3A01&'
      param += `end_date=${this.getTime()}&`
      param += 'end_time=23%3A59%3A59&'
      param += 'type=graph&'
      param += 'realtime=true'

      // axios request
      const http = axios.get(`${httpApi.host}/app/data/sensor/${this.$route.params.s_id}?api_key=${httpApi.ApiKey}&${param}`, {
        headers: {
          Authorization: sessionStorage.getItem('token'),
        },
      })

      // axios response
      http.then(response => {
        // if the date is valid
        const { data } = response.data.data
        const limit = data
        this.items = limit
        this.rows = this.items.length
        // axios finish data render
        http.finally(() => {
          // menyimpan data ke chart filter storage
          for (let x = 0; x < limit.value.length; x += 1) {
            if (num === false) {
              if (Date.parse(limit.created_at[x]) <= Date.now()) {
                let timeStamp = limit.created_at[x].split(' ')
                timeStamp = this.timeConvert(timeStamp[1], 1)
                limit.value[x] = limit.value[x] === null ? 0.000 : limit.value[x]
                if (x === 0) {
                  this.chart.xAxisData.push('')
                  this.chart.series.push(`${limit.value[x]}`)
                }
                this.chart.xAxisData.push(`${timeStamp}`)
                this.chart.series.push(`${limit.value[x]}`)
                sessionStorage.setItem('last_number', x)
              }
            }
          }

          const index = parseInt(sessionStorage.getItem('last_number'), 10)

          if ((limit.value[index + 1] !== null) && (Date.parse(limit.created_at[index + 1]) <= Date.now())) {
            sessionStorage.setItem('last_number', (index + 1))
            let timeStamp = limit.created_at[(index + 1)].split(' ')
            timeStamp = this.timeConvert(timeStamp[1], 1)
            this.chart.xAxisData.push(`${timeStamp}`)
            this.chart.series.push(`${limit.value[(index + 1)]}`)
            console.log('update')
          } else {
            console.log('keep')
          }

          setTimeout(() => this.graph_data_realtime(true), 5000)
        })
      })
    },

    // filter display as per hours
    displayMinutes() {
      const timeseries = []
      const databundle = []
      for (let x = 0; x < this.rows; x += 1) {
        let maindata = this.items[x].created_at

        // get date
        maindata = maindata.split('T')
        const getdate = maindata[0]

        // get time
        maindata = maindata[1].split('.')
        const gettime = this.timeConvert(maindata[0], 1)

        // get value
        const getvals = this.items[x].value

        // set limit time
        const TLIM = parseInt((Date.now() / 1000), 10)
        const TNOW = this.strToTime(this.items[x].created_at) - (3600 * 7)

        // databundle
        if (this.strToTime(getdate) >= this.strToTime(this.startDate) && this.strToTime(getdate) <= this.strToTime(this.endDate) && TNOW <= TLIM) {
          databundle.push([`${gettime}`, getvals])
          timeseries.push(`${gettime}`)
        }
      }

      const TS = [...new Set(timeseries)]
      databundle.reverse()
      TS.reverse()
      const DB = this.multiDimensionalUnique(databundle, TS)
      return DB
    },

    // filter display as per hours
    displayHour() {
      const timeseries = []
      const databundle = []
      for (let x = 0; x < this.rows; x += 1) {
        let maindata = this.items[x].created_at

        // get date
        maindata = maindata.split('T')
        const getdate = maindata[0]
        const datelabel = this.dateConvert(getdate, 0)

        // get time
        maindata = maindata[1].split('.')
        maindata = maindata[0].split(':')
        const gettime = this.timeConvert(`${maindata[0]}:${maindata[1]}:00`)

        // get value
        const getvals = this.items[x].value

        // set limit time
        const TLIM = parseInt((Date.now() / 1000), 10)
        const TNOW = this.strToTime(this.items[x].created_at) - (3600 * 7)

        // databundle
        if (this.strToTime(getdate) >= this.strToTime(this.startDate) && this.strToTime(getdate) <= this.strToTime(this.endDate) && TNOW <= TLIM) {
          databundle.push([`${datelabel} ${gettime}`, getvals])
          timeseries.push(`${datelabel} ${gettime}`)
        }
      }

      const TS = [...new Set(timeseries)]
      databundle.reverse()
      TS.reverse()
      const DB = this.multiDimensionalUnique(databundle, TS)
      return DB
    },

    // filter display as per days
    displayDay() {
      const timeseries = []
      const databundle = []
      for (let x = 0; x < this.rows; x += 1) {
        let maindata = this.items[x].created_at

        // get date
        maindata = maindata.split('T')
        const getdate = maindata[0]
        const datelabel = this.dateConvert(getdate, 1)

        // get value
        const getvals = this.items[x].value

        // set limit time
        const TLIM = parseInt((Date.now() / 1000), 10)
        const TNOW = this.strToTime(this.items[x].created_at) - (3600 * 7)

        // databundle
        if (this.strToTime(getdate) >= this.strToTime(this.startDate) && this.strToTime(getdate) <= this.strToTime(this.endDate) && TNOW <= TLIM) {
          databundle.push([`${datelabel}`, getvals])
          timeseries.push(`${datelabel}`)
        }
      }

      const TS = [...new Set(timeseries)]
      databundle.reverse()
      TS.reverse()
      const DB = this.multiDimensionalUnique(databundle, TS)
      return DB
    },

    // filter display as per days
    displayMonth() {
      const timeseries = []
      const databundle = []
      for (let x = 0; x < this.rows; x += 1) {
        let maindata = this.items[x].created_at

        // get date
        maindata = maindata.split('T')
        maindata = maindata.split('-')
        const getdate = `${maindata[0]}-${maindata[1]}`

        // get value
        const getvals = this.items[x].value

        // set limit time
        const TLIM = parseInt((Date.now() / 1000), 10)
        const TNOW = this.strToTime(this.items[x].created_at) - (3600 * 7)

        // databundle
        if (this.strToTime(getdate) >= this.strToTime(this.startDate) && this.strToTime(getdate) <= this.strToTime(this.endDate) && TNOW <= TLIM) {
          databundle.push([`${getdate}`, getvals])
          timeseries.push(`${getdate}`)
        }
      }

      const TS = [...new Set(timeseries)]
      databundle.reverse()
      TS.reverse()
      const DB = this.multiDimensionalUnique(databundle, TS)
      return DB
    },
    render() {
      this.chart.series = []
      this.chart.xAxisData = []
      // menset data durasi tanggal yang di simpan pada session storage ke dalam local storage untuk chart
      if (sessionStorage.getItem('date_start') !== null) {
        // Jika durasi tanggal sudah pernah di set
        this.startDate = sessionStorage.getItem('date_start') // tanggal mulai
        this.endDate = sessionStorage.getItem('date_end') // tanggal akhir
        this.timediff = sessionStorage.getItem('timediff') // selisih waktu antara tanggal mulai dan tanggal akhir
      } else {
        // Durasi tanggal bawaan jika tidak di set
        this.startDate = this.getTime(1) // tanggal mulai
        this.endDate = this.getTime()// tanggal akhir
        this.timediff = this.strToTime(this.endDate) - this.strToTime(this.startDate) // selisih waktu antara tanggal mulai dengan tanggal akhir
      }

      // menset data durasi tanggal yang di simpan pada session storage ke dalam local storage untuk table
      if (sessionStorage.getItem('Tdate_start') !== null) {
        // Jika durasi tanggal sudah pernah di set
        this.TStartDate = sessionStorage.getItem('Tdate_start') // tanggal mulai
        this.TEndDate = sessionStorage.getItem('Tdate_end') // tanggal akhir
        this.TTimediff = sessionStorage.getItem('Ttimediff') // selisih waktu antara tanggal mulai dengan tanggal akhir
      } else {
        // Durasi tanggal bawaan jika tidak di set
        this.TStartDate = `${this.getTime()} 00:00:01` // tanggal mulai
        this.TEndDate = `${this.getTime()} 23:59:59` // tanggal akhir
        this.TTimediff = 86400 // selisih waktu tetap ( satuan detik untuk 1 jam )
      }

      // pengaturan jenis chart
      this.chart_types = sessionStorage.getItem('chart_types') === null ? 'Range' : sessionStorage.getItem('chart_types')

      // pengaturan interval label data yang akan di tampilkan apda chart
      if (sessionStorage.getItem('lowshorting') !== null) {
        this.lowshorting = sessionStorage.getItem('lowshorting')
        if (this.chart_types === 'Real-Time') {
          // untuk data realtime
          this.chart.interval = 0
        } else if (this.timediff <= 86400) {
          // jika durasi filter data dalam kurun waktu 24 jam
          this.chart.interval = this.lowshorting === 'Minutes' ? 0 : 0
        } else if (this.timediff > 86400 && this.timediff <= (86400 * 2)) {
          // Jika durasi data yang di filter dalam kurun waktu 1 - 2 hari
          this.chart.interval = 3
        } else if (this.timediff > (86400 * 2) && this.timediff <= (86400 * 4)) {
          // jika durasi data yang di filter dalam kurun waktu 2 - 4 hari
          this.chart.interval = 5
        } else if (this.timediff > (86400 * 4) && this.timediff <= (86400 * 7)) {
          // jika durasi data yang di filter dalam kurun waktu 4 - 7 hari
          this.chart.interval = 10
        } else if (this.timediff > (86400 * 7)) {
          // Jika durasi data yang di filter melebihi 7 hari
          this.chart.interval = 1
        }
      }

      // data untuk persortingan table berdasarkan sensor status dari data
      // ex : Up / Down
      if (sessionStorage.getItem('table_status') === null) {
        sessionStorage.setItem('table_status', 'all')
      }

      // menampilkan advance input field untuk pemfilteran data berdasarkan satuan jam / menit
      // field ini hanya akan di tampilkan jika tanggal mulai dan berakhir memiliki kesamaan data
      if (this.startDate === this.endDate) {
        this.advance = true
      }
    },
    // date filter chart submit
    dateFilterChart() {
      const timestamp1 = Date.parse(`${this.startDate} 00:00:01`) / 1000
      const timestamp2 = Date.parse(`${this.endDate} 23:59:59`) / 1000
      const calcstamps = timestamp2 - timestamp1

      if (timestamp1 > timestamp2) {
        this.$fire({
          title: 'Invalid date range !!!',
          text: 'start date exceeds the end date',
          type: 'error',
          timer: 6000,
        })
      } else {
        sessionStorage.setItem('date_start', this.startDate)
        sessionStorage.setItem('date_end', this.endDate)
        sessionStorage.setItem('timediff', calcstamps)
        sessionStorage.setItem('lowshorting', this.lowshorting)
        sessionStorage.setItem('chart_types', 'Range')
        this.render()
        setTimeout(() => this.graph_data(), 500)
      }
    },

    // date filter table submit
    dateFilterTable() {
      const timestamp1 = Date.parse(`${this.TStartDate}`) / 1000
      const timestamp2 = Date.parse(`${this.TEndDate}`) / 1000
      const calcstamps = timestamp2 - timestamp1

      if (timestamp1 > timestamp2) {
        this.$fire({
          title: 'Invalid date range !!!',
          text: 'start date exceeds the end date',
          type: 'error',
          timer: 6000,
        })
      } else if (calcstamps < (3600 * 17)) {
        this.$fire({
          title: 'Invalid date range !!!',
          text: 'Not allowed to set the range less than 17 Hours.',
          type: 'error',
          timer: 6000,
        })
      } else {
        sessionStorage.setItem('Tdate_start', this.TStartDate)
        sessionStorage.setItem('Tdate_end', this.TEndDate)
        sessionStorage.setItem('Ttimediff', calcstamps)
        this.table_sensor()
        // window.location.reload()
      }
    },

    updateState() {
      const pageTotal = Math.floor((this.items1.length / this.perpage))
      this.last_entries = this.perpage * this.currentPage
      if (this.currentPage === (pageTotal + 1)) {
        this.last_entries = this.items1.length
      }
      this.first_entries = ((this.currentPage - 1) * this.perpage) + 1
    },
    loadPage(page) {
      this.currentPage = page
      this.first_entries = 1
      this.updateState()
    },
    switch_chart(data) {
      const cId = data.target.value
      sessionStorage.setItem('chart_types', cId)
      this.render()
      setTimeout(() => (this.chart_types === 'Range' ? this.graph_data() : this.graph_data_realtime()), 500)
    },

    // table sorting as status
    status(data) {
      sessionStorage.setItem('table_status', data)
      this.table_sensor()
    },

    // str to time
    strToTime(data) {
      return (Date.parse(data) / 1000)
    },

    // get current time
    getTime(type = 0) {
      const today = new Date()
      let dd = '01'
      if (type === 1) {
        dd = '01'
      } else {
        dd = String(today.getDate()).padStart(2, '0')
      }
      const mm = String(today.getMonth() + 1).padStart(2, '0')
      const yyyy = today.getFullYear()
      return `${yyyy}-${mm}-${dd}`
    },

    // array dulicate data remover
    multiDimensionalUnique(arr, ts) {
      const uniques = []
      const itemsFound = {}
      const result = []
      for (let i = 0, l = arr.length; i < l; i += 1) {
        const stringified = JSON.stringify(arr[i])
        if (!itemsFound[stringified]) {
          uniques.push(arr[i])
          itemsFound[stringified] = true
        }
      }
      for (let x = 0; x < uniques.length; x += 1) {
        if (uniques[x][1] === null) {
          const data = 0
          result.push([uniques[x][0], data])
        } else {
          const data = parseFloat(uniques[x][1], 10)
          result.push([uniques[x][0], data])
        }
      }

      let total = 0
      let accul = 0
      const rs = []
      for (let x = 0; x < ts.length; x += 1) {
        for (let y = 0; y < result.length; y += 1) {
          if (ts[x] === result[y][0]) {
            if (result[y][1] > 0) {
              accul += result[y][1]
              total += 1
            }
          }
        }
        let avg = 0
        if (accul > 0) {
          avg = accul / total
        } else {
          avg = accul
        }
        rs.push([ts[x], avg.toFixed(2)])
        if (accul > 0) {
          accul = 0
          total = 0
        }
      }
      return rs
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

    // compare start date and end date
    dateMatch() {
      if (this.startDate === this.endDate) {
        this.advance = true
      } else {
        this.advance = false
      }
    },
  },
}
</script>

<style lang="scss">
@import '@core/scss/vue/libs/vue-flatpicker.scss';
@import '@/assets/scss/detail.scss';
</style>
