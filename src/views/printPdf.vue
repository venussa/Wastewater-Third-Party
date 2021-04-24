<!-- eslint-disable-->
<template>
  <div v-if="this.api !== false">
    <div style="background: transparent; width: 100%; height: 100%; position: fixed; top:0px;left: 0px; z-index: 999" />
    <div class="row">
    <div style="width: 90%; margin: auto">
    <section slot="pdf-content">
    <!-- header-page -->
    <section slot="pdf-item">
      <div style="width: 100%; background: #666; color:#fff; padding: 5px;margin-bottom: 20px">
        Synapsis Monitoring Plathform
        <span style="float: right">{{ this.getTime(0, true) }}</span>
      </div>

    <!-- header-data -->
      <h1 class="title-section1" style="color:#666; font-size: 18px; border-bottom: 2px #666 solid">
      <span style="font-weight: 400">Report for</span> {{ api.data.name }}</h1>
      <table style="width: 80%; margin-left: 13%">
        <tr>
          <td>
            <p>Project : {{projectName}}</p>
            <p>Group : {{groupName}}</p>
            <p>Node : {{nodeName}}</p>
            <p>Sensor Name : {{api.data.name}}</p>
          </td>
          <td>
            <p>Description : {{api.data.description}}</p>
            <p>Data Type : {{ api.data.data_type }}</p>
            <p>Status : 
              <span v-if="lastSensor.sensor_status === 'down'">Down</span>
              <span v-if="lastSensor.sensor_status !== 'down'">Up</span>
            </p>
            <p>Last Update : {{lastSensor.updated_at}}</p>
          </td>
        </tr>
      </table>

    <!-- uptime status -->
      <div style="border: none;border-top: 2px #666 solid; padding-top: 30px;text-align: center">
        <p style="display: inline-block; padding: 10px">Last data : <strong>{{ lastSensor.value }}</strong></p>
        <p style="display: inline-block; padding: 10px">Up time : <strong>{{ times.uptime }}</strong></p>
        <p style="display: inline-block; padding: 10px">Down time : <strong>{{ times.downtime }}</strong></p>
      </div>

    <!-- chart data -->
      <div class="chart-label">
        <div style="margin-bottom: 20px;text-align: center">
          <strong>{{ startDate }} 00:00</strong> until <strong>{{ endDate }} 23:59</strong>
        </div>
        <p class="y"><strong>Sensor Value</strong></p>
        <p class="x"><strong>Time Series</strong></p>
        <div style="padding-left: 50px;width: 75%">
            <app-echart-line :option-data="chart" />
        </div>
      </div>
    </section>
    <!-- table heading -->
    <section slot="pdf-item">
      <div style="border: none;border-top: 2px #666 solid; padding-top: 30px;text-align: center;margin-bottom: 30px;margin-top: 30px">
        <strong>{{ TStartDate }}</strong> until <strong>{{ TEndDate }}</strong>
      </div>

    <!-- table data -->
      <table width="100%" border="1" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;margin-left: 10px">
        <tr>
          <th style="width: 30px">No</th>
          <th>Update Time</th>
          <th>Value</th>
          <th>Status</th>
        </tr>
        <tr v-for="data2 in items1">
          <td>{{ data2.no }}</td>
          <td>{{ data2.created_at }}</td>
          <td>{{ data2.value }}</td>
          <td>
              <span v-if="data2.sensor_status === 'down'" >Down</span>
              <span v-if="data2.sensor_status !== 'down'" >Up</span>
          </td>
        </tr>
      </table>
    </section>
    </section>
    </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import httpApi from '@/main'
import AppEchartLine from '@core/components/charts/echart/AppEchartLine.vue'

export default {
  components: {
    AppEchartLine,
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
        interval: 1, // jeda waktu menampilkan label
      },
      cStorage: false, // menyimpan data chart hasil filtering

      // table field data
      // paramater key untuk meregister nama index data
      // paramater label untuk membuat custom name untuk field title
      // sortable menampilkan tombol automatic sorting pada table field title
      fields: [
        {
          key: 'no',
          label: 'No',
        },
        {
          key: 'created_at',
          label: 'Update Time',
        },
        {
          key: 'value',
          label: 'Value',
        },
        {
          key: 'sensor_status',
          label: 'status',
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
      perpage: 100, // jumlah data yang ditampilkan untuk tiap halaman pada table
      rows: 0, // banyaknya data yang di tampilkan pada chart
      rows1: 0, // banyaknya data yang di tampilkan pada table
      projectName: '',
      projectId: '',
      TmpGroupName: '',
      groupName: '',
      groupId: '',
      nodeName: '',
      tableTmp: [],
      tableSplit1: [],
      tableSplit2: [],
    }
  },
  created() {
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

    // pengaturan interval label data yang akan di tampilkan apda chart
    if (sessionStorage.getItem('lowshorting') !== null) {
      this.lowshorting = sessionStorage.getItem('lowshorting')
      if (this.timediff <= 86400) {
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
      this.graph_data() // call graph data
      this.table_sensor() // call table data
      this.project_name()
    })
  },

  methods: {
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
        // DATA EX : 2021-01-01T16:40:00.00000000z => SPLIT
        // DELIMIMER 1 = T
        // RESULT = [2021-01-01, 16:40:00.00000000z]
        // DATE STRING = RESULT[0] => SPLIT
        // DELIMITER 2 = .
        // RESULT = [16:40:00, 00000000z]
        // TIME STRING = 16:40:00

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
            // DATA EX : 2021-01-01T16:40:00.00000000z => SPLIT
            // DELIMIMER 1 = T
            // RESULT = [2021-01-01, 16:40:00.00000000z]
            // DATE STRING = RESULT[0] => SPLIT
            // DELIMITER 2 = .
            // RESULT = [16:40:00, 00000000z]
            // TIME STRING = 16:40:00
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
          let limData = 25
          let tmpData = []

          for (let x = 0; x < this.rows1; x += 1) {
            if (x === 0) {
              this.tableSplit1.push([this.items1[x]])
            } else if (x <= limData) {
              tmpData.push(this.items1[x])
              if (x === limData || x === (this.rows1 - 1)) {
                this.tableSplit2.push(tmpData)
                tmpData = []
                limData += 25
              }
            }
          }
          // console.log(this.items1)
        }
      })
    },

    // mendapatkan data untuk di tampilkan pada chart
    graph_data() {
      // query param
      let param = `start_date=${this.startDate}&`
      param += 'start_time=00%3A00%3A01&'
      param += `end_date=${this.endDate}&`
      param += 'end_time=23%3A59%3A59'

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
          // console.log(limit)
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

    project_name() {
      const http = axios.get(`${httpApi.host}/project`, {
        headers: { Authorization: sessionStorage.getItem('token') },
      })

      http.then(response => { this.projectName = response.data.data })

      http.finally(() => {
        for (let x = 0; x < this.projectName.length; x += 1) {
          if (this.projectName[x].api_key === httpApi.ApiKey) {
            this.projectId = this.projectName[x].id
            this.projectName = this.projectName[x].name
            break
          }
        }
        this.node_name()
      })
    },

    group_name() {
      const http = axios.get(`${httpApi.host}/group?project_id=${this.projectId}`, {
        headers: { Authorization: sessionStorage.getItem('token') },
      })

      http.then(response => { this.TmpGroupName = response.data.data })

      http.finally(() => {
        for (let x = 0; x < this.TmpGroupName.length; x += 1) {
          if (this.TmpGroupName[x].id === this.groupId) {
            this.groupId = this.TmpGroupName[x].id
            this.groupName = this.TmpGroupName[x].name
            break
          }
        }
        if (this.$route.params.ex === 'true') {
          setTimeout(() => this.generateReport(), 2000)
        } else {
          setTimeout(() => window.print(), 2000)
        }
      })
    },

    node_name() {
      const http = axios.get(`${httpApi.host}/app/node/${this.$route.params.n_id}?api_key=${httpApi.ApiKey}`, {
        headers: { Authorization: sessionStorage.getItem('token') },
      })

      http.then(response => { this.nodeName = response.data.data })

      http.finally(() => {
        this.groupId = this.nodeName.id
        this.nodeName = this.nodeName.name
      })
      this.group_name()
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

    // str to time
    strToTime(data) {
      return (Date.parse(data) / 1000)
    },

    pad(t) {
      let st = t
      while (st.length < 2) {
        st = `0${st}`
      }
      return st
    },

    // get current time
    getTime(type = 0, clock = false) {
      const today = new Date()
      let dd = '01'
      if (type === 1) {
        dd = '01'
      } else {
        dd = String(today.getDate()).padStart(2, '0')
      }
      const hh = this.pad(today.getHours())
      const ii = this.pad(today.getMinutes())
      const ss = this.pad(today.getSeconds())
      const mm = String(today.getMonth() + 1).padStart(2, '0')
      const yyyy = today.getFullYear()
      const time = `${hh}:${ii}:${ss}`
      return clock === true ? `${yyyy}-${mm}-${dd} ${time}` : `${yyyy}-${mm}-${dd}`
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
  },
}
</script>

<style lang="scss">
@import '@/assets/scss/detail.scss';

body{
    background: #fff !important;
}
td,th{
  padding: 10px;
}
.html2pdf__page-break{
  page-break-before: always;
}
</style>
