import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/theme.scss';
import './plugins/ga.js';
import './plugins/filters.js'
import _ from 'lodash'
import {
  lodashMixin
} from './plugins/util.js'

_.mixin(lodashMixin)


Vue.config.productionTip = false
Vue.mixin({
  data() {
    return {}
  },
  methods: {
    _APPINIT: function (callback) {
      window.onload = () => {

        window.FBInstant.initializeAsync().then(() => {
          window.FBInstant.startGameAsync().then(() => {

            let Profile = {
              name: window.FBInstant.player.getName(),
              id: window.FBInstant.player.getID(),
              locale: window.FBInstant.getLocale(),
              photo: window.FBInstant.player.getPhoto() ?
                window.FBInstant.player.getPhoto() : "nophoto.jpg",
              contextID: window.FBInstant.context.getID()
            }
            this.$store.dispatch('SET_PROFILE', Profile);
            console.log(Profile)

            // this._LOAD_INTERSTITIAL();
            return callback && callback();
          });
        });
      }
    },
    _SHOW_INTERSTITIAL(callback) {
      if (!window.isPreloadInter) return false;
      window.preloadedInterstitial
        .showAsync()
        .then(() => {
          // Perform post-ad success operation
          window.isPreloadInter = false;
          if (callback) {
            callback();
          }
        })
        .catch((e) => {
          window.isPreloadInter = false;
          // this._LOAD_INTERSTITIAL();
          console.log(e.message);
        });
    },
    _LOAD_INTERSTITIAL() {
      if (window.isPreloadInter) return false;
      //"251139782956072_266336121436438" // Your Ad Placement Id
      window.FBInstant.getInterstitialAdAsync(
          'xx'
        )
        .then(function (interstitial) {
          window.preloadedInterstitial = interstitial;
          window.isPreloadInter = true;
          return window.preloadedInterstitial.loadAsync();
        })
        .then(function () {
          console.log("btn-interstitial");
        })
        .catch(function (err) {
          console.log("Interstitial failed to preload: " + err.message);
        });
    },
    _STORE_FETCH: function (STORAGE_KEY) {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    },
    _STORE_SAVE: function (STORAGE_KEY, data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }
});
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')