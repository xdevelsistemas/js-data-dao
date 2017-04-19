import { Request, Response, NextFunction } from 'express'
import { ForgotDAO } from '../models/forgot-dao'
import { AppConfig } from '../config/app-config'
import { DAO } from '../models/dao'
import { IBaseUser } from '../interfaces'
import * as nodemailer from 'nodemailer'
export class ForgotController {
  forgot: ForgotDAO
  appConfig: AppConfig

  constructor ( appConfig: AppConfig, userDAO: DAO<IBaseUser>, transporter?: nodemailer.Transporter ) {
    this.appConfig = appConfig
    this.forgot = new ForgotDAO( appConfig, userDAO, transporter )
  }

  /**
   * Envia um email para resetar a senha do usuário que a esqueceu
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} [next]
   * @returns {Promise<IUser>}
   *
   * @memberOf ForgotController
   */
  public sendMail ( req: Request, res: Response, next?: NextFunction ): Promise<any> {
    return this.forgot.sendForgotMail( req.body, this.appConfig.getForgotUrl() )
      .then(() => {
        res.status( 200 )
        return 'Email enviado'
      } )
      .catch(( error: any ) => next( error ) )
  }

  /**
   * Valida o token do parâmetro
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns {Promise<any>}
   *
   * @memberOf ForgotController
   */
  public validaToken ( req: Request, res: Response, next: NextFunction ): Promise<any> {
    return this.forgot.validaToken( req.params )
      .then(( dados: any ) => {
        res.status( 200 )
        return dados
      } )
      .catch(( error ) => next( error ) )
  }

  /**
   * Verifica o token e reseta a senha do usuário
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns {Promise<any>}
   *
   * @memberOf ForgotController
   */
  public resetPassword ( req: Request, res: Response, next: NextFunction ): Promise<any> {
    return this.forgot.resetPassword( req.params, req.body )
      .then(( dados: any ) => {
        res.status( 200 )
        return dados
      } )
      .catch(( error ) => next( error ) )
  }
}
