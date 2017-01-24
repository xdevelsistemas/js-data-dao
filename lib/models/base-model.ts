import { IBaseModel } from '../interfaces'
import { ServiceLib } from '../services/service-lib'

export class BaseModel implements IBaseModel {
    id: string
    active: boolean
    createdAt?: Date
    updatedAt?: Date
    constructor(id?: string) {
        if (!id) {
            this.id = ServiceLib.generateId()
        } else {
            this.id = id
        }
        this.active = true
        this.createdAt = new Date()
        this.updatedAt = new Date()
    }
}
