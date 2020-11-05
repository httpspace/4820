import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [{
  path: '/',
  name: '2048',
  component: Home
}]

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes
})

export default router