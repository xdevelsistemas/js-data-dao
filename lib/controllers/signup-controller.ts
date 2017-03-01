import { Request, Response, NextFunction } from 'express'
import { SignUpDAO } from '../models/signup-dao'
import * as JSData from 'js-data'
import { AppConfig } from '../config/app-config'
import { IBaseUser } from '../interfaces'
import {DAO} from '../models/dao'
import * as nodemailer from 'nodemailer'

export class SignupController {
  signUpDAO: SignUpDAO
  config: AppConfig

  constructor ( store: JSData.DataStore, appConfig: AppConfig, userDAO: DAO<IBaseUser>, transporter?: nodemailer.Transporter ) {
    this.config = appConfig
    this.signUpDAO = new SignUpDAO( store, appConfig, userDAO, transporter )
  }
  /**
   * Envia um email para criar o primeiro login
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} [next]
   * @returns {Promise<IUser>}
   *
   * @memberOf ForgotController
   */
  public sendMail ( req: Request, res: Response, next?: NextFunction ): Promise<any> {
    return this.signUpDAO.sendSignUpMail( req.body, this.config.getSignUpUrl() )
      .then(() => {
        res.status( 200 )
        return 'Email enviado'
      } )
  }

  /**
   * Valida o token do parâmetro
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns {Promise<any>}
   *
   * @memberOf SignupController
   */
  public validaToken ( req: Request, res: Response, next: NextFunction ): Promise<any> {
    return this.signUpDAO.validaToken( req.params )
      .then(( dados: any ) => {
        res.status( 200 )
        return dados
      } )
  }

  /**
   * Verifica o token e cadastra a senha para o usuário
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns {Promise<any>}
   *
   * @memberOf SignupController
   */
  public registerPassword ( req: Request, res: Response, next: NextFunction ): Promise<any> {
    return this.signUpDAO.registerPassword( req.params, req.body )
      .then(( dados: any ) => {
        res.status( 200 )
        return dados
      } )
  }
}
