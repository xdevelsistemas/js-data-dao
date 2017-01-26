import { IBaseModel } from './ibase-model'

export interface IResultSearch<T extends IBaseModel> {
  page: number,
  total: number,
  result: T[]
}
