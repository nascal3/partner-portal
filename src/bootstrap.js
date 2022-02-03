import Auth from "@/libs/auth/Auth"
import Vue from 'vue'

window.Vue = require('vue')
window._ = require('lodash')
window.axios = require('axios')
window.dayjs = require('dayjs')

window.auth = new Auth()
window.events = new Vue()

window.flash = function(details) {
    window.events.$emit('flash', details)
}

window.url = function(endpoint) {
    return svcConfig.VUE_APP_PARTNER_BFF + endpoint.replace(/^\/|\/$/g, '')
}


window.visa = function() {
    let token = auth.retrieve('token')
    return {
        'headers': {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Accept-Language': localStorage.getItem('setLanguage') || 'en',
            ...(token) && {
                'Authorization': `Bearer ${token}`
            },
        }
    }
}

window.reportable = [
    401, 403, 404, 500
]