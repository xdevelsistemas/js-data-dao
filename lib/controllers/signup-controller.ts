import { Request, Response, NextFunction } from 'express'
import { SignUpDAO } from '../models/signup-dao'
import { APIError } from '../services'
import * as JSData from 'js-data'
import {MailConfig} from '../config/mail-config'
import {AppConfig} from '../config/app-config'

export class SignupController {
    Signup: SignUpDAO

    constructor(store: JSData.DS, mailConfig: MailConfig, appConfig: AppConfig) {
        this.Signup = new SignUpDAO(store,appConfig,mailConfig)
    }

    /**
     * Valida o token do parâmetro
     * 
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @returns {JSData.JSDataPromise<any>}
     * 
     * @memberOf SignupController
     */
    public validaToken(req: Request, res: Response, next: NextFunction): JSData.JSDataPromise<any> {
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
     * @returns {JSData.JSDataPromise<any>}
     * 
     * @memberOf SignupController
     */
    public registerPassword(req: Request, res: Response, next: NextFunction): JSData.JSDataPromise<any> {
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
