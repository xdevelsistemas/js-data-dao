"use strict";

const services_1 = require('../services');
class BasePersistController {
    constructor(collection) {
        this.collection = collection;
    }
    find(req, res, next) {
        return this.collection.find(req.params.id, req.user).then(reg => {
            delete reg.password;
            res.status(200);
            return reg;
        }).catch(error => {
            throw new services_1.APIError(error, 400);
        });
    }
    findAll(req, res, next) {
        return this.collection.findAll(req.query, req.user).then(regs => {
            regs.map(reg => {
                delete reg.password;
                return reg;
            });
            res.status(200);
            return regs;
        }).catch(error => {
            throw new services_1.APIError(error, 400);
        });
    }
    create(req, res, next) {
        return this.collection.create(req.body, req.user).then(reg => {
            delete reg.password;
            res.status(201);
            return reg;
        }).catch(error => {
            throw new services_1.APIError(error, 400);
        });
    }
    update(req, res, next) {
        return this.collection.update(req.params.id, req.body, req.user).then(reg => {
            delete reg.password;
            res.status(200);
            return reg;
        }).catch(error => {
            throw new services_1.APIError(error, 400);
        });
    }
    delete(req, res, next) {
        return this.collection.delete(req.params.id, req.user).then(isDeleted => {
            res.status(200);
            return isDeleted;
        }).catch(error => {
            throw new services_1.APIError(error, 400);
        });
    }
    query(req, res, next) {
        return this.collection.paginatedQuery(req.body, req.user, req.query.page, req.query.limit).then(result => {
            result.result.map(reg => {
                delete reg.password;
                return reg;
            });
            res.status(200);
            return result;
        }).catch(error => {
            throw new services_1.APIError(error, 400);
        });
    }
}
exports.BasePersistController = BasePersistController;
//# sourceMappingURL=base-persist-controller.js.map
