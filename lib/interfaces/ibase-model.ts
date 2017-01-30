import * as JSData from 'js-data'

export interface IBaseModel {
  _collectionName: string
  id?: string
  active?: boolean
  createdAt?: Date
  updatedAt?: Date
  getSchema(): JSData.Schema
  getCollectionName(): string
}
