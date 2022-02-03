import Base from "@/libs/core/Base";
import Form from "@/libs/core/Form";
import { fields } from './AuthRepository'

export default class Auth extends Base {
    constructor() {
        super(fields);
        this.form = new Form(fields)
        this.app = svcConfig.VUE_APP_PORTAL
    }

    register() {
        return new Promise(async(resolve, reject) => {
            try {
                const data = this.getFields([
                    'business_name', 'legal_entity_type', 'country_id', 'administrator', 'product_group'
                ])
                const response = await this.form.submit('post', url('sign-up'), data)
                flash({
                    message: 'Registration successful. Redirecting ...',
                    color: 'green'
                })
                this.email = data.administrator.email
                resolve(response)
            } catch (err) {
                reject(err)
            }
        })
    }

    generate() {
        return new Promise(async(resolve, reject) => {
            try {
                const data = this.getFields(['email', 'authenticator', 'product_group'])
                const response = await this.form.submit('post', url('otp/generate'), data)
                const identifier = this.identifier.toLowerCase()
                localStorage.setItem('sendy:identification', JSON.stringify({
                    identifier,
                    value: this[identifier],
                }))
                flash(response)
                resolve(response)
            } catch (err) {
                reject(err)
            }
        })
    }

    verify() {
        return new Promise(async(resolve, reject) => {
            try {
                const data = this.getFields(['email', 'authenticator', 'code', 'product_group'])
                const response = await this.form.submit('post', url('sign-in'), data)
                this.encrypt(response.data)
                resolve(response)
            } catch (err) {
                reject(err)
            }
        })
    }

    abilities() {
        return new Promise(async(resolve, reject) => {
            try {
                const partner = auth.retrieve('partner')
                const response = await this.form.submit('get', url(`partners/${partner.id}/abilities`))
                this.encrypt({
                    ...this.decrypt(),
                    abilities: response.data
                })

                //Fetch and cache the country data
                const { data } = await this.form.submit('get', url(`countries/${partner.country_id}`))
                this.encrypt({
                    ...this.decrypt(),
                    country: data,
                })

                resolve(response)
            } catch (err) {
                reject(err)
            }
        })
    }

    logout() {
        /** @todo - add call to API to expire the token */
        localStorage.removeItem(this.app)
        flash({
            message: 'You have been logged out successfully'
        })
    }
}