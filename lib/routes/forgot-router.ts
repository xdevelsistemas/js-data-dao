import { MailConfig } from '../config/mail-config'
import { AppConfig } from '../config/app-config'
import { Request, Response, Router, NextFunction } from 'express'
import { ForgotController } from '../controllers'
import { BaseRouter } from './base-router'
import * as JSData from 'js-data'

export class ForgotRouter extends BaseRouter {
    controller: ForgotController
    store: JSData.DS
    router: Router

    constructor (store: JSData.DS, appConfig: AppConfig, mailConfig: MailConfig) {
        super()
        this.controller = new ForgotController(store, mailConfig, appConfig)
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
