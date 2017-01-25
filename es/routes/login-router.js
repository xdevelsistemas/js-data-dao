"use strict";

const express_1 = require('express');
const passport_1 = require('../auth/passport');
class LoginRouter {
    constructor(store, appConfig) {
        this.store = store;
        this.router = express_1.Router();
        this.routers();
    }
    routers() {
        this.router.post('/', (req, res, next) => passport_1.jwtGenerator(this.store, this.appConfig)(req, res, next));
    }
    getRouter() {
        return this.router;
    }
}
exports.LoginRouter = LoginRouter;
//# sourceMappingURL=login-router.js.map
