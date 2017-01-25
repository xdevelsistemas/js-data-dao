"use strict";

const signup_dao_1 = require('../models/signup-dao');
const services_1 = require('../services');
class SignupController {
    constructor(store, mailConfig, appConfig) {
        this.Signup = new signup_dao_1.SignUpDAO(store, appConfig, mailConfig);
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
    validaToken(req, res, next) {
        return this.Signup.validaToken(req.params).then(dados => {
            res.status(200);
            return dados;
        }).catch(err => {
            throw new services_1.APIError(err, 401);
        });
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
    registerPassword(req, res, next) {
        return this.Signup.registerPassword(req.params, req.body).then(dados => {
            res.status(200);
            return dados;
        }).catch(err => {
            throw new services_1.APIError(err, 401);
        });
    }
}
exports.SignupController = SignupController;
//# sourceMappingURL=signup-controller.js.map
