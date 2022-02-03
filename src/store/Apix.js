import { resources, helpers } from './resources'
import UrlAction from "./UrlAction"

export default class Apix {
    constructor() {
        this.state = {}
        this.actions = {}
        this.getters = {}
        this.mutations = {}
        this.setState()
        this.setActions()
        this.setGetters()
        this.setMutations()
    }

    /*
     * Set the state variables
     */
    setState() {
        resources.forEach(({ name }) => {
            this.state[name] = []
        })
    }

    /*
     * Return the state variables
     */
    getState() {
        return this.state
    }

    /*
     * Set the getters
     */
    setGetters() {
        resources.forEach(({ name }) => {
            let functionName = 'get' + helpers.upper(name)
            this.getters[functionName] = function(state) {
                return state[name]
            }.bind(this)
        })
    }

    /*
  
     * Get the getters
     */
    getGetters() {
        return this.getters
    }

    /*
     * Set the actions
     */
    setActions() {
        resources.forEach(({ name, url }) => {
            let baseUrl = `${svcConfig.VUE_APP_PARTNER_BFF}${url.replace(/^\/+/g, '')}`
            let functionName = 'set' + helpers.upper(name)
            this.actions[functionName] = function(context, options = {}) {
                let actionUrl = new UrlAction(baseUrl, options).getUrl()
                return new Promise((resolve, reject) => {
                    axios.get(actionUrl, visa()).then(({ data }) => {
                        context.commit(functionName, data)
                        resolve(data)
                    }).catch(error => {
                        const status = error.response.status
                            // if (status === 403) {
                            //   location = '/unauthorised'
                            // }
                            // if (status === 404) {
                            //   location = '/unavailable'
                            // }
                        reject(error)
                    })
                })
            }
        })
    }

    /*
     * Get actions
     */
    getActions() {
        return this.actions
    }

    /*
     * Set Mutations
     */
    setMutations() {
        resources.forEach(({ name }) => {
            let functionName = 'set' + helpers.upper(name)
            this.mutations[functionName] = (state, value) => {
                state[name] = value
            }
        })
    }

    /*
     * Get mutations
     */
    getMutations() {
        return this.mutations
    }
}