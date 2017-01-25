"use strict";
const forgot_dao_1 = require("../models/forgot-dao");
const services_1 = require("../services");
class ForgotController {
    constructor(store, mailConfig, appConfig) {
        this.forgot = new forgot_dao_1.ForgotDAO(store, mailConfig, appConfig);
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
    sendMail(req, res, next) {
        return this.forgot.sendForgotMail(req.body)
            .then(() => {
            res.status(200);
            return 'Email enviado';
        })
            .catch((err) => {
            throw new services_1.APIError(err, 400);
        });
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
    validaToken(req, res, next) {
        return this.forgot.validaToken(req.params)
            .then((dados) => {
            res.status(200);
            return dados;
        })
            .catch((err) => {
            throw new services_1.APIError(err, 401);
        });
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
    resetPassword(req, res, next) {
        return this.forgot.resetPassword(req.params, req.body)
            .then((dados) => {
            res.status(200);
            return dados;
        })
            .catch((err) => {
            throw new services_1.APIError(err, 401);
        });
    }
}
exports.ForgotController = ForgotController;

//# sourceMappingURL=forgot-controller.js.map
