"use strict";
const Bluebird = require("bluebird");
const _ = require("lodash");
const mail_config_1 = require("../config/mail-config");
const service_lib_1 = require("../services/service-lib");
class SignUpDAO {
    constructor(store, appConfig, mailConfig) {
        this.storedb = store;
        this._appConfig = appConfig;
        this._mailConfig = new mail_config_1.MailConfig();
        this._serviceLib = new service_lib_1.ServiceLib(appConfig);
    }
    /**
     * Valida o token e retorna o user com email do token
     *
     * @param {*} params
     * @returns {JSData.JSDataPromise<IBaseUser>}
     * @memberOf SignUpDAO
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
        return this.storedb.findAll(this._appConfig.getUsersTable(), filterUser)
            .then((users) => {
            let user = _.head(users);
            if (_.isEmpty(user)) {
                throw 'Token inválido';
            }
            else if (data.expiration < today) {
                throw 'O token expirou';
            }
            else if (!user.active) {
                throw 'A conta foi desativada';
            }
            delete user.password;
            return user;
        });
    }
    /**
     * Verifica o token e cadastra a senha para o usuário
     *
     * @param {*} params
     * @param {*} obj
     * @returns {JSData.JSDataPromise<IBaseUser>}
     *
     * @memberOf SignUpDAO
     */
    registerPassword(params, obj) {
        let data = JSON.parse(this._serviceLib.decrypt(params.token));
        let today = new Date();
        let filterUser = {
            where: {
                email: {
                    '===': data.email
                }
            }
        };
        return this.storedb.findAll(this._appConfig.getUsersTable(), filterUser)
            .then((users) => {
            let user = _.head(users);
            if (_.isEmpty(user)) {
                throw 'Token inválido';
            }
            else if (data.expiration < today) {
                throw 'O token expirou';
            }
            else if (!user.active) {
                throw 'A conta foi desativada';
            }
            else if (!obj.password) {
                throw 'A senha não foi definida';
            }
            else if (obj.password.length < 6) {
                throw 'A senha deve conter no mínimo 6 caracteres';
            }
            return Bluebird.all([
                user,
                service_lib_1.ServiceLib.hashPassword(obj.password)
            ]);
        })
            .then((resp) => {
            let user = resp[0];
            let passwordEncrypted = resp[1];
            user.password = passwordEncrypted;
            return this.storedb.update(this._appConfig.getUsersTable(), user.id, user);
        })
            .then(() => true);
    }
}
exports.SignUpDAO = SignUpDAO;

//# sourceMappingURL=signup-dao.js.map
