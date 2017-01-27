import { AppConfig } from '../config/app-config'
import { Request, Response, Router, NextFunction } from 'express'
import { ForgotController } from '../controllers'
import { BaseRouter } from './base-router'
import * as JSData from 'js-data'

export class ForgotRouter extends BaseRouter {
  controller: ForgotController
  store: JSData.DataStore
  router: Router

  constructor(store: JSData.DataStore, appConfig: AppConfig) {
    super()
    this.controller = new ForgotController(store, appConfig)
    this.store = store
    this.router = Router()
    this.routers()
  }

  public routers() {
    let ctrl = this
    this.router.get('/:token', (req: Request, res: Response, next: NextFunction) =>
      this.respond(ctrl.controller.validaToken(req, res, next), res))

    this.router.post('/:token', (req: Request, res: Response, next: NextFunction) =>
      this.respond(ctrl.controller.resetPassword(req, res, next), res))
  }

  public getRouter(): Router {
    return this.router
  }
}
