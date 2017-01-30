import { IBaseModel } from '../interfaces'
import { ServiceLib } from '../services/service-lib'

export class BaseModel implements IBaseModel {
  id?: string
  active?: boolean
  createdAt?: Date
  updatedAt?: Date
  constructor(obj?: IBaseModel) {
    if (obj) {
      if (obj.id) {
        this.id = obj.id
      } else {
        this.id = ServiceLib.generateId()
      }
      this.active = (obj.active === null || obj.active === undefined ) ? true : obj.active
      this.createdAt = obj.createdAt || new Date()
      this.updatedAt = obj.updatedAt || new Date()
    } else {
      this.id = ServiceLib.generateId()
      this.active = true
      this.createdAt = new Date()
      this.updatedAt = null
    }
  }
}
