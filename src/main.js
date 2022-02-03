require('./bootstrap')
require('./views')

import Vue from 'vue'
import App from './App.vue'
import i18n from './i18n'
import router from './router'
import store from './store'
import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/tracing";
import vuetify from './plugins/vuetify'
import './assets/sass/app.scss'

Vue.config.productionTip = false

Sentry.init({
    Vue,
    dsn: "https://2a1ed506f7124aaba8d015b8e0e4b9a6@o32379.ingest.sentry.io/6179395",
    integrations: [
        new BrowserTracing({
            routingInstrumentation: Sentry.vueRouterInstrumentation(router),
            tracingOrigins: ["localhost", "https://partner.sendyit.com/login", /^\//],
        }),
    ],
    environment: svcConfig.DOCKER_ENV,
    tracesSampleRate: 1.0,
    logErrors: true
});

new Vue({
    router,
    store,
    vuetify,
    i18n,
    render: h => h(App)
}).$mount('#app')