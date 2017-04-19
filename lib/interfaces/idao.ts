import { IResultSearch } from './iresult-search'
import { IBaseModel } from './ibase-model'
import { IBaseUser } from './ibase-user'

export interface IDAO<T extends IBaseModel> {
  create (t: any, user: IBaseUser, options?: any): Promise<T>
  find (id: string, user: IBaseUser, options?: any): Promise<T>
  findAll (query: Object, user: IBaseUser, options?: any): Promise<T[]>
  update (id: string, user: IBaseUser, t: T): Promise<T>
  delete (id: string, user: IBaseUser): Promise<boolean>
  paginatedQuery (search: any, user: IBaseUser, page?: number, limit?: number, options?: any): Promise<IResultSearch<T>>
  parseModel ( obj: any ): T
}
