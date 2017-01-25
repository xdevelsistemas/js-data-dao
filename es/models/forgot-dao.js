"use strict";

const service_lib_1 = require('../services/service-lib');
const sendmail_1 = require('../services/sendmail');
const Bluebird = require('bluebird');
const _ = require('lodash');
class ForgotDAO {
    constructor(store, mailConfig, appConfig) {
        this.storedb = store;
        this._appConfig = appConfig;
        this._sendMail = new sendmail_1.SendMail(mailConfig);
        this._serviceLib = new service_lib_1.ServiceLib(appConfig);
    }
    /**
     * Envia um email para o usuário
     *
     * @param {IForgot} obj
     * @returns {JSData.JSDataPromise<IBaseUser>}
     *
     * @memberOf ForgotDAO
     */
    sendForgotMail(obj) {
        let filterEmail = { where: { email: { '===': obj.email } } };
        return this.storedb.findAll(this._appConfig.getUsersTable(), filterEmail).then(users => {
            if (_.isEmpty(users)) {
                throw 'Usuário não encontrado';
            } else if (!service_lib_1.ServiceLib.emailValidator(obj.email)) {
                throw 'Email inválido';
            }
            let user = _.head(users);
            let token = this._serviceLib.generateToken(obj.email);
            return this._sendMail.sendForgotEmail(user.name, obj.email, `https://app.safetruck.com.br/auth/forgot/${token}`);
        });
    }
    /**
     * Valida o token e retorna o user com email do token
     *
     * @param {*} params
     * @returns {JSData.JSDataPromise<IBaseUser>}
     *
     * @memberOf ForgotDAO
     */
    validaToken(params) {
        let tokenDecrypted = this._serviceLib.decrypt(params.token);
        let data = JSON.parse(tokenDecrypted);
        let today = new Date();
        let filterUser = {
            where: {
                email: {
                    '===': data.email
                }
            }
        };
        return this.storedb.findAll(this._appConfig.getUsersTable(), filterUser).then(users => {
            let user = _.head(users);
            if (_.isEmpty(user)) {
                throw 'Token inválido';
            } else if (data.expiration < today) {
                throw 'O token expirou';
            } else if (!user.active) {
                throw 'A conta foi desativada';
            }
            delete user.password;
            return user;
        });
    }
    /**
     * Verifica o token e reseta a senha do usuário
     *
     * @param {*} params
     * @param {*} obj
     * @returns {JSData.JSDataPromise<IBaseUser>}
     *
     * @memberOf ForgotDAO
     */
    resetPassword(params, obj) {
        let data = JSON.parse(this._serviceLib.decrypt(params.token));
        let today = new Date();
        let filterUser = {
            where: {
                email: {
                    '===': data.email
                }
            }
        };
        return this.storedb.findAll(this._appConfig.getUsersTable(), filterUser).then(users => {
            let user = _.head(users);
            if (_.isEmpty(user)) {
                throw 'Token inválido';
            } else if (data.expiration < today) {
                throw 'O token expirou';
            } else if (!user.active) {
                throw 'A conta foi desativada';
            } else if (!obj.password) {
                throw 'A nova senha não foi definida';
            } else if (obj.password.length < 6) {
                throw 'A nova senha deve conter no mínimo 6 caracteres';
            }
            return Bluebird.all([user, service_lib_1.ServiceLib.hashPassword(obj.password)]);
        }).then(resp => {
            let user = resp[0];
            let passwordEncrypted = resp[1];
            user.password = passwordEncrypted;
            return this.storedb.update(this._appConfig.getUsersTable(), user.id, user);
        }).then(() => true);
    }
}
exports.ForgotDAO = ForgotDAO;
//# sourceMappingURL=forgot-dao.js.map
