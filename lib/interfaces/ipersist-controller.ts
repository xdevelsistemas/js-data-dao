import { Request, Response } from 'express'
import { IBaseModel, IDAO, IResultSearch } from '.'
import * as JSData from 'js-data'

export interface IPersistController<T extends IBaseModel> {
  collection: IDAO<T>
  find(req: Request, res: Response, next?: Function): JSData.JSDataPromise<T>
  findAll(req: Request, res: Response, next?: Function): JSData.JSDataPromise<T[]>
  create(req: Request, res: Response, next?: Function): JSData.JSDataPromise<T>
  update(req: Request, res: Response, next?: Function): JSData.JSDataPromise<T>
  delete(req: Request, res: Response, next?: Function): JSData.JSDataPromise<boolean>
  query(req: Request, res: Response, next?: Function): JSData.JSDataPromise<IResultSearch<T>>
}
