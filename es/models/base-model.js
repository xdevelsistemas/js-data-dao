"use strict";

const service_lib_1 = require('../services/service-lib');
class BaseModel {
    constructor(id) {
        if (!id) {
            this.id = service_lib_1.ServiceLib.generateId();
        } else {
            this.id = id;
        }
        this.active = true;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}
exports.BaseModel = BaseModel;
//# sourceMappingURL=base-model.js.map
