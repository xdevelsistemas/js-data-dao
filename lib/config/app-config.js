"use strict";
/**
 * This class have all application config
 * If necessary add more configuration, please inherit the class and add more config
 */
class AppConfig {
    constructor() {
        this._mainCompany = process.env.MAIN_COMPANY;
        this._isProd = (process.env.NODE_ENV === 'production');
        this._cryptoAlgorithm = process.env.CRYPTO_ALGORITHM || 'aes192';
        this._cryptoPassword = process.env.CRYPTO_PASSWORD;
        this._expirationDays = Number.parseInt(process.env.EXPIRATION_DAYS, 10) || 3;
        this._usersTable = process.env.USERS_TABLE || 'users';
        this._jwtConfig = {
            strategy: 'jwt',
            secret: process.env.APP_JWT_SECRET,
            session: { session: (process.env.APP_JWT_SESSION || false) }
        };
    }
    getMainCompany() {
        return this._mainCompany;
    }
    getIsProd() {
        return this._isProd;
    }
    getCryptoAlgorithm() {
        return this._cryptoAlgorithm;
    }
    getCryptoPassword() {
        return this._cryptoPassword;
    }
    getExpirationDays() {
        return this._expirationDays;
    }
    getUsersTable() {
        return this._usersTable;
    }
    getJwtConfig() {
        return this._jwtConfig;
    }
}
exports.AppConfig = AppConfig;

//# sourceMappingURL=app-config.js.map
