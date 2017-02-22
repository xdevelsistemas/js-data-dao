import { AppConfig } from '../config/app-config'
import { Request, Response, Router, NextFunction } from 'express'
import { jwtGenerator } from '../auth/passport'
import * as JSData from 'js-data'

export class LoginRouter {
  store: JSData.DataStore
  router: Router
  appConfig: AppConfig

  constructor (store: JSData.DataStore, appConfig: AppConfig) {
    this.store = store
    this.router = Router()
    this.appConfig = appConfig
    this.routers()
  }

  public routers () {
    this.router.post('/', (req: Request, res: Response, next: NextFunction): Promise<Response> =>
      jwtGenerator(this.store, this.appConfig)(req, res, next))
  }

  public getRouter (): Router {
    return this.router
  }
}
