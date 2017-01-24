"use strict";
const Boom = require("boom");
class APIError extends Error {
    constructor(message, statusCode, objectResponse) {
        super(message);
        this.statusCode = statusCode;
        this.objectResponse = objectResponse;
        this.definedBoomError();
        this.showError();
    }
    definedBoomError() {
        switch (this.statusCode) {
            case 400:
                this.error = Boom.badRequest(this.message).output.payload;
                break;
            case 401:
                this.error = Boom.unauthorized(this.message).output.payload;
                break;
            default:
                this.error = Boom.create(this.statusCode, this.message).output.payload;
                break;
        }
    }
    showError() {
        let err = this;
        console.error(`API ERROR CODE: ${err.statusCode}`);
        console.error(`API ERROR MESSAGE: ${err.message}`);
        console.error(`API ERROR STACK: ${err.stack}`);
    }
}
exports.APIError = APIError;

//# sourceMappingURL=api-error.js.map
