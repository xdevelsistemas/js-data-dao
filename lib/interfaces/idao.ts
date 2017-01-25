import { IResultSearch } from './iresult-search'
import { IBaseModel } from './ibase-model'
import { IBaseUser } from './ibase-user'
import * as JSData from 'js-data'

export interface IDAO<T extends IBaseModel> {
    create(t: T, user: IBaseUser): JSData.JSDataPromise<T>
    find(id: string, user: IBaseUser): JSData.JSDataPromise<T>
    findAll(query: Object, user: IBaseUser): JSData.JSDataPromise<T[]>
    update(id: string,user: IBaseUser, t: T): JSData.JSDataPromise<T>
    delete(id: string,user: IBaseUser): JSData.JSDataPromise<boolean>
    paginatedQuery(search: Object,user: IBaseUser, page?: number, limit?: number): JSData.JSDataPromise<IResultSearch<T>>
}
