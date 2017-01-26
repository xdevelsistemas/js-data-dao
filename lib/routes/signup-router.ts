import { AppConfig } from '../config/app-config'
import { Request, Response, Router, NextFunction } from 'express'
import { SignupController } from '../controllers'
import { BaseRouter } from './base-router'
import * as JSData from 'js-data'

export class SignupRouter extends BaseRouter {
  controller: SignupController
  store: JSData.DS
  router: Router

  constructor(store: JSData.DS, appConfig: AppConfig) {
    super()
    this.controller = new SignupController(store, appConfig)
    this.store = store
    this.router = Router()
    this.routers()
  }

  public routers() {
    let ctrl = this
    this.router.get('/:token', (req: Request, res: Response, next: NextFunction) =>
      this.respond(ctrl.controller.validaToken(req, res, next), res))

    this.router.post('/:token', (req: Request, res: Response, next: NextFunction) =>
      this.respond(ctrl.controller.registerPassword(req, res, next), res))
  }

  public getRouter(): Router {
    return this.router
  }
}
