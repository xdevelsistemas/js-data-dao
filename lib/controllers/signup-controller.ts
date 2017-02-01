import { Request, Response, NextFunction } from 'express'
import { SignUpDAO } from '../models/signup-dao'
import { APIError } from '../services'
import * as JSData from 'js-data'
import { AppConfig } from '../config/app-config'
import * as nodemailer from 'nodemailer'

export class SignupController {
  Signup: SignUpDAO

  constructor(store: JSData.DataStore, appConfig: AppConfig, transporter?: nodemailer.Transporter) {
    this.Signup = new SignUpDAO(store, appConfig, transporter)
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
  public validaToken(req: Request, res: Response, next: NextFunction): Promise<any> {
    return this.Signup.validaToken(req.params)
      .then((dados: any) => {
        res.status(200)
        return dados
      })
      .catch((err: any) => {
        throw new APIError(err, 401)
      })
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
  public registerPassword(req: Request, res: Response, next: NextFunction): Promise<any> {
    return this.Signup.registerPassword(req.params, req.body)
      .then((dados: any) => {
        res.status(200)
        return dados
      })
      .catch((err: any) => {
        throw new APIError(err, 401)
      })
  }
}
