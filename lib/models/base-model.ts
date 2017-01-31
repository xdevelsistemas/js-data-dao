import { IBaseModel } from '../interfaces'
import { ServiceLib } from '../services/service-lib'
export class BaseModel implements IBaseModel {
  id?: string
  active?: boolean
  createdAt?: number
  updatedAt?: number
  constructor(obj?: IBaseModel) {
    if (obj) {
      if (obj.id) {
        this.id = obj.id
      } else {
        this.id = ServiceLib.generateId()
      }
      this.active = (obj.active === null || obj.active === undefined) ? true : obj.active
      this.createdAt = obj.createdAt || new Date().getTime()
      this.updatedAt = obj.updatedAt || new Date().getTime()
    } else {
      this.id = ServiceLib.generateId()
      this.active = true
      this.createdAt = new Date().getTime()
      this.updatedAt = null
    }
  }
}
