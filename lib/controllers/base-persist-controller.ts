import * as JSData from 'js-data'
import { APIError } from '../services'
import { IDAO, IBaseModel, IResultSearch, IPersistController } from '../interfaces'
import { Request, Response } from 'express'


export class BasePersistController<T extends IBaseModel> implements IPersistController<T> {
    collection: IDAO<T>
    public constructor(collection: IDAO<T>) {
        this.collection = collection
    }
    public find(req: Request, res: Response, next?: Function): JSData.JSDataPromise<T> {
        return this.collection.find(req.params.id, req.user)
            .then(reg => {
                delete (reg as any).password
                res.status(200)
                return reg
            })
            .catch(error => {
                throw new APIError(error, 400)
            })
    }

    public findAll(req: Request, res: Response, next?: Function): JSData.JSDataPromise<T[]> {
        return this.collection.findAll(req.query, req.user)
            .then(regs => {
                regs.map(reg => {
                    delete (reg as any).password
                    return reg
                })
                res.status(200)
                return regs
            })
            .catch(error => {
                throw new APIError(error, 400)
            })
    }

    public create(req: Request, res: Response, next?: Function): JSData.JSDataPromise<T> {
        return this.collection.create(req.body, req.user)
            .then(reg => {
                delete (reg as any).password
                res.status(201)
                return reg
            })
            .catch(error => {
                throw new APIError(error, 400)
            })
    }

    public update(req: Request, res: Response, next?: Function): JSData.JSDataPromise<T> {
        return this.collection.update(req.params.id, req.body, req.user)
            .then(reg => {
                delete (reg as any).password
                res.status(200)
                return reg
            })
            .catch(error => {
                throw new APIError(error, 400)
            })
    }

    public delete(req: Request, res: Response, next?: Function): JSData.JSDataPromise<boolean> {
        return this.collection.delete(req.params.id, req.user)
            .then((isDeleted) => {
                res.status(200)
                return isDeleted
            })
            .catch(error => {
                throw new APIError(error, 400)
            })
    }

    public query(req: Request, res: Response, next?: Function): JSData.JSDataPromise<IResultSearch<T>> {
        return this.collection.paginatedQuery(req.body, req.user, req.query.page, req.query.limit)
            .then((result) => {
                result.result.map(reg => {
                    delete (reg as any).password
                    return reg
                })
                res.status(200)
                return result
            })
            .catch(error => {
                throw new APIError(error, 400)
            })
    }
}
