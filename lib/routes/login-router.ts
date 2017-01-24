import { AppConfig } from '../config/app-config'
import { Request, Response, Router, NextFunction } from 'express'
import { jwtGenerator } from '../auth/passport'
import * as JSData from 'js-data'

export class LoginRouter {
    store: JSData.DS
    router: Router
    appConfig: AppConfig

    constructor (store: JSData.DS, appConfig: AppConfig) {
        this.store = store
        this.router = Router()
        this.routers()
    }

    public routers() {
        this.router.post('/', (req: Request, res: Response, next: NextFunction): JSData.JSDataPromise<Response> =>
            jwtGenerator(this.store, this.appConfig)(req, res, next))
    }

    public getRouter(): Router {
        return this.router
    }
}
