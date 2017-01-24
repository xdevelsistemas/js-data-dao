"use strict";
const express_1 = require("express");
class BaseRouter {
    respond(t, res) {
        return t
            .then((u) => res.json(u))
            .catch((err) => res.status(err.statusCode).json(err.error));
    }
}
exports.BaseRouter = BaseRouter;
class PersistRouter extends BaseRouter {
    constructor(store, controller) {
        super();
        this.controller = controller;
        this.router = express_1.Router();
        this.routers();
    }
    routers() {
        let ctrl = this.controller;
        /* GET lista todos os registros da classe corrente em controller. */
        this.router.get('/', (req, res, next) => this.respond(ctrl.findAll(req, res, next), res));
        /* GET busca o registro com o id. */
        this.router.get('/:id', (req, res, next) => this.respond(ctrl.find(req, res, next), res));
        /* POST cria um novo registro da classe corrente em controller. */
        this.router.post('/', (req, res, next) => this.respond(ctrl.create(req, res, next), res));
        /* PUT atualiza o registro. */
        this.router.put('/:id', (req, res, next) => this.respond(ctrl.update(req, res, next), res));
        /* DELETE deleta o registro com o id. */
        this.router.delete('/:id', (req, res, next) => this.respond(ctrl.delete(req, res, next), res));
        /* POST lista paginada com os registros da classe corrente em controller. */
        this.router.post('/query', (req, res, next) => this.respond(ctrl.query(req, res, next), res));
    }
    getRouter() {
        return this.router;
    }
}
exports.PersistRouter = PersistRouter;

//# sourceMappingURL=base-router.js.map
