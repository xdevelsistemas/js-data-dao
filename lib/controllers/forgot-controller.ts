import { Request, Response, NextFunction } from 'express'
import { ForgotDAO } from '../models/forgot-dao'
import { APIError } from '../services'
import {AppConfig} from '../config/app-config'
import * as JSData from 'js-data'

export class ForgotController {
    forgot: ForgotDAO

    constructor(store: JSData.DS, appConfig: AppConfig) {
        this.forgot = new ForgotDAO(store,appConfig)
    }

    /**
     * Envia um email para resetar a senha do usuário que a esqueceu
     * 
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} [next]
     * @returns {JSData.JSDataPromise<IUser>}
     * 
     * @memberOf ForgotController
     */
    public sendMail(req: Request, res: Response, next?: NextFunction): JSData.JSDataPromise<any> {
        return this.forgot.sendForgotMail(req.body)
            .then(() => {
                res.status(200)
                return 'Email enviado'
            })
            .catch((err: any) => {
                throw new APIError(err, 400)
            })
    }

    /**
     * Valida o token do parâmetro
     * 
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @returns {JSData.JSDataPromise<any>}
     * 
     * @memberOf ForgotController
     */
    public validaToken(req: Request, res: Response, next: NextFunction): JSData.JSDataPromise<any> {
        return this.forgot.validaToken(req.params)
            .then((dados: any) => {
                res.status(200)
                return dados
            })
            .catch((err: any) => {
                throw new APIError(err, 401)
            })
    }

    /**
     * Verifica o token e reseta a senha do usuário
     * 
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @returns {JSData.JSDataPromise<any>}
     * 
     * @memberOf ForgotController
     */
    public resetPassword(req: Request, res: Response, next: NextFunction): JSData.JSDataPromise<any> {
        return this.forgot.resetPassword(req.params, req.body)
            .then((dados: any) => {
                res.status(200)
                return dados
            })
            .catch((err: any) => {
                throw new APIError(err, 401)
            })
    }
}
