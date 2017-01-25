"use strict";
const passport_jwt_1 = require("passport-jwt");
const services_1 = require("../services");
const Bluebird = require("bluebird");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
exports.passportJwt = (store, passport, appConfig) => {
    let params = {
        secretOrKey: appConfig.getJwtConfig().secret,
        jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeader()
    };
    passport.use(new passport_jwt_1.Strategy(params, (token, done) => {
        // Login buscando os dados do usuário junto do client.
        // Isso facilitará na hora de filtrar por clients e equipments do usuário logado
        let options = { with: ['clients'] };
        // TOdo Erro ao relacionar user com client
        store.find(appConfig.getUsersTable(), token.id, options)
            .then((user) => {
            if (user) {
                if (!user.active) {
                    return done(new services_1.APIError('Cliente ou usuário desabilitado', 401), null);
                }
                else {
                    let u = user;
                    u.isAdmin = u.companyAlias === appConfig.getMainCompany();
                    return done(null, u);
                }
            }
            else {
                return done(new services_1.APIError('Unauthorized', 401), null);
            }
        });
    }));
    return passport;
};
exports.jwtGenerator = (store, appConfig) => (req, res, nex) => {
    let { email, password } = req.body;
    if (email && password) {
        let options = {
            email: {
                '===': email
            }
        };
        return store.findAll(appConfig.getUsersTable(), options)
            .then((users) => {
            let user = _.head(users);
            if (_.isEmpty(user)) {
                throw 'O usuário não foi encontrado';
            }
            else if (!user.active) {
                throw 'A conta foi desativada';
            }
            return Bluebird.all([user, services_1.ServiceLib.comparePassword(password, user.password)]);
        })
            .then((resp) => {
            let user = resp[0];
            let encryptedPassword = resp[1];
            if (encryptedPassword) {
                delete user.password;
                return res.status(200).json(`JWT ${jwt.sign(user, appConfig.getJwtConfig().secret, { expiresIn: '3 days' })}`);
            }
            throw 'Invalid password';
        })
            .catch(err => {
            // throw new APIError(err, 401)
            let { statusCode, error } = new services_1.APIError(err, 401);
            return res.status(statusCode).json(error);
        });
    }
    else {
        throw new services_1.APIError('Invalid fields', 401);
    }
};
//# sourceMappingURL=passport.js.map