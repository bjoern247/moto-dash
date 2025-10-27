import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from './layouts/DefaultLayout.vue'

const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('./pages/Dashboard.vue'),
      },
      {
        path: 'bikes',
        name: 'bikes',
        component: () => import('./pages/Bikes.vue'),
      },
      {
        path: 'maintenance',
        name: 'maintenance',
        component: () => import('./pages/Maintenance.vue'),
      },
      {
        path: 'fuel',
        name: 'fuel',
        component: () => import('./pages/Fuel.vue'),
      },
      {
        path: 'tours',
        name: 'tours',
        component: () => import('./pages/Tours.vue'),
      },
      {
        path: 'parts',
        name: 'parts',
        component: () => import('./pages/Parts.vue'),
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('./pages/Settings.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router

