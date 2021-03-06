import Base from '@/libs/core/Base'
import Form from '@/libs/core/Form'
import { fields } from './VehicleRepository'

export default class Vehicle extends Base {
  constructor () {
    super(fields)
    this.form = new Form(fields)
    this.group = auth.retrieve('partner')
  }

  store () {
    return new Promise(async (resolve, reject) => {
      try {
        const data = this.getFields([
          'vendor_type_id',
          'registration_number',
        ])
        let response = await this.form.submit('post', url(`partners/${this.group.id}/vehicles`), data)
        this.setFields(fields)
        resolve(response)
      } catch (err) {
        reject(err)
      }
    })
  }

  show (vehicleId) {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await this.form.submit("get", url(`partners/${this.group.id}/vehicles/${vehicleId}`))
        resolve(response)
      } catch (err) {
        reject(err)
      }
    })
  }

  update (userId) {
    const data = this.getFields();
    return new Promise(async (resolve, reject) => {
      try {
        let response = await this.form.submit("patch", url(`partners/${this.group}/users/${userId}`), data)
        resolve(response)
      } catch (err) {
        reject(err)
      }
    })
  }
}

