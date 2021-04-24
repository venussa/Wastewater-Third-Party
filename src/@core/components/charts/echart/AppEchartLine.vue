<!-- eslint-disable -->
<template>
  <e-charts
    ref="line"
    autoresize
    :options="this.configChart()"
    theme="theme-color"
    auto-resize
  />
</template>

<script>
import ECharts from 'vue-echarts'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/legend'
import 'echarts/lib/chart/line'
import theme from './theme.json'

ECharts.registerTheme('theme-color', theme)

export default {
  components: {
    ECharts,
  },
  props: {
    optionData: {
      type: Object,
      default: null,
    },
  },
  methods: {
    configChart() {
      return {
        // Make gradient line here
        visualMap: [{
          show: true,
          type: 'continuous',
          min: 0,
          max: 400,
        }],
        grid: {
          width: '96%',
          left: '30px',
          top: '10px',
          show: true,
        },
        tooltip: {
          trigger: 'axis',
        },
        xAxis: [{
          boundaryGap: false,
          data: this.optionData.xAxisData,
          axisLabel: {
            rotate: 40,
            showMinLabel: false,
            fontSize: 10,
            interval: this.optionData.interval,
          },
        }],
        yAxis: {
          type: 'value',
          splitLine: { show: false },
        },
        series: {
          type: 'line',
          showSymbol: false,
          data: this.optionData.series,
          color: '#00bb8a',
        },
      }
    },
  },
}
</script>

<style>
.echarts {
  width: 100% !important;
}
</style>
