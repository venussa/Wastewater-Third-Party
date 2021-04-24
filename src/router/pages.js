export default [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/home.vue'),
  },
  {
    path: '/node',
    name: 'node',
    component: () => import('@/views/node.vue'),
  },
  {
    path: '/node/:n_id',
    name: 'sensor',
    component: () => import('@/views/sensor.vue'),
  },
  {
    path: '/node/:n_id/sensor/:s_id',
    name: 'detail',
    component: () => import('@/views/detail.vue'),
  },
  {
    path: '/export/:n_id/:s_id',
    name: 'export',
    component: () => import('@/views/html2pdf.vue'),
  },
  {
    path: '/print/:n_id/:s_id/:ex',
    name: 'print',
    component: () => import('@/views/printPdf.vue'),
  },
]
