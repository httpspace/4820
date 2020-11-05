import VueAnalytics from 'vue-analytics'
import Vue from 'vue'
import router from '../router'

var isProduction = true
// console.log(isProduction)
Vue.use(VueAnalytics, {
    id: 'UA-36871701-3',
    router,
    debug: {
        enabled: !isProduction,
        sendHitTask: isProduction
    },
    autoTracking: {
        pageviewOnLoad: false
    }
})