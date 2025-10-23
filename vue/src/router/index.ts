import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import FishingLocation from '../views/FishingLocation.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/location/:id',
    name: 'FishingLocation',
    component: FishingLocation,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router