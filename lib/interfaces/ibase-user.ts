import {IBaseModel} from './ibase-model'
export interface IBaseUser extends IBaseModel {
    name: string
    companyAlias: string
    email: string
    username: string
    password: string
    newPassword?: string
    isAdmin: boolean
}
