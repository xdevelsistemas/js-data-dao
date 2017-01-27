import { IResultSearch } from './iresult-search'
import { IBaseModel } from './ibase-model'
import { IBaseUser } from './ibase-user'

export interface IDAO<T extends IBaseModel> {
  create(t: T, user: IBaseUser): Promise<T>
  find(id: string, user: IBaseUser): Promise<T>
  findAll(query: Object, user: IBaseUser): Promise<T[]>
  update(id: string, user: IBaseUser, t: T): Promise<T>
  delete(id: string, user: IBaseUser): Promise<boolean>
  paginatedQuery(search: Object, user: IBaseUser, page?: number, limit?: number): Promise<IResultSearch<T>>
}
