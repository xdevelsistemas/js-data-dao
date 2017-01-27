import { Request, Response } from 'express'
import { IBaseModel, IDAO, IResultSearch } from '.'

export interface IPersistController<T extends IBaseModel> {
  collection: IDAO<T>
  find(req: Request, res: Response, next?: Function): Promise<T>
  findAll(req: Request, res: Response, next?: Function): Promise<T[]>
  create(req: Request, res: Response, next?: Function): Promise<T>
  update(req: Request, res: Response, next?: Function): Promise<T>
  delete(req: Request, res: Response, next?: Function): Promise<boolean>
  query(req: Request, res: Response, next?: Function): Promise<IResultSearch<T>>
}
