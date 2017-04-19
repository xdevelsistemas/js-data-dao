import { IBaseUser } from '../interfaces'
import { AppConfig } from '../config/app-config'
import { Request, Response, Router, NextFunction } from 'express'
import { ForgotController } from '../controllers'
import { DAO } from '../models/dao'
import { BaseRouter } from './base-router'
import * as JSData from 'js-data'
import * as nodemailer from 'nodemailer'

export class ForgotRouter extends BaseRouter {
  controller: ForgotController
  store: JSData.DataStore
  router: Router

  constructor ( appConfig: AppConfig, userDAO: DAO<IBaseUser>, transporter?: nodemailer.Transporter ) {
    super()
    this.controller = new ForgotController( appConfig, userDAO, transporter )
    this.router = Router()
    this.routers()
  }

  public routers () {
    let ctrl = this

    this.router.post( '/', ( req: Request, res: Response, next: NextFunction ) =>
      this.respond( ctrl.controller.sendMail( req, res, next ), res, next ) )

    this.router.get( '/:token', ( req: Request, res: Response, next: NextFunction ) =>
      this.respond( ctrl.controller.validaToken( req, res, next ), res, next ) )

    this.router.post( '/:token', ( req: Request, res: Response, next: NextFunction ) =>
      this.respond( ctrl.controller.resetPassword( req, res, next ), res, next ) )
  }

  public getRouter (): Router {
    return this.router
  }
}
