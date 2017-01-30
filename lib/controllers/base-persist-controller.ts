import { APIError } from '../services'
import { IDAO, IBaseModel, IResultSearch, IPersistController } from '../interfaces'
import * as express from 'express'

/**
 * devido problemas no @types/passport foi herdado o request
 */
export interface Request extends express.Request {
  authInfo?: any
  user?: any

  // These declarations are merged into express's Request type
  login(user: any, done: (err: any) => void): void
  login(user: any, options: any, done: (err: any) => void): void
  logIn(user: any, done: (err: any) => void): void
  logIn(user: any, options: any, done: (err: any) => void): void

  logout(): void
  logOut(): void

  isAuthenticated(): boolean
  isUnauthenticated(): boolean
}

export class BasePersistController<T extends IBaseModel> implements IPersistController<T> {
  collection: IDAO<T>
  public constructor(collection: IDAO<T>) {
    this.collection = collection
  }
  public find(req: Request, res: express.Response, next?: express.NextFunction): Promise<T> {
    return this.collection.find(req.params.id, req.user)
      .then((reg: T) => {
        delete (reg as any).password
        res.status(200)
        return reg
      })
      .catch((err : string) => {
        throw new APIError(err, 400)
      })
      .catch((err : Error) => {
        throw new APIError(err.message, 400)
      })
  }

  public findAll(req: Request, res: express.Response, next?: express.NextFunction): Promise<T[]> {
    return this.collection.findAll(req.query, req.user)
      .then((regs: T[]) => {
        regs.map(reg => {
          delete (reg as any).password
          return reg
        })
        res.status(200)
        return regs
      })
      .catch((err : string) => {
        throw new APIError(err, 400)
      })
      .catch((err : Error) => {
        throw new APIError(err.message, 400)
      })
  }

  public create(req: Request, res: express.Response, next?: express.NextFunction): Promise<T> {
    return this.collection.create(req.body, req.user)
      .then((reg: T) => {
        delete (reg as any).password
        res.status(201)
        return reg
      })
      .catch((err : string) => {
        throw new APIError(err, 400)
      })
      .catch((err : Error) => {
        throw new APIError(err.message, 400)
      })
  }

  public update(req: Request, res: express.Response, next?: express.NextFunction): Promise<T> {
    return this.collection.update(req.params.id, req.body, req.user)
      .then((reg: T) => {
        delete (reg as any).password
        res.status(200)
        return reg
      })
      .catch((err : string) => {
        throw new APIError(err, 400)
      })
      .catch((err : Error) => {
        throw new APIError(err.message, 400)
      })
  }

  public delete(req: Request, res: express.Response, next?: express.NextFunction): Promise<boolean> {
    return this.collection.delete(req.params.id, req.user)
      .then((isDeleted) => {
        res.status(200)
        return isDeleted
      })
      .catch((err : string) => {
        throw new APIError(err, 400)
      })
      .catch((err : Error) => {
        throw new APIError(err.message, 400)
      })
  }

  public query(req: Request, res: express.Response, next?: express.NextFunction): Promise<IResultSearch<T>> {
    return this.collection.paginatedQuery(req.body, req.user, req.query.page, req.query.limit)
      .then((result) => {
        result.result.map(reg => {
          delete (reg as any).password
          return reg
        })
        res.status(200)
        return result
      })
      .catch((err : string) => {
        throw new APIError(err, 400)
      })
      .catch((err : Error) => {
        throw new APIError(err.message, 400)
      })
  }
}
