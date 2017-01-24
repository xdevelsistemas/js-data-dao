"use strict";
class MailConfig {
    constructor() {
        this._from = process.env.EMAIL_FROM;
        this._email = process.env.EMAIL_NAME;
        this._user = process.env.EMAIL_USER;
        this._password = process.env.EMAIL_PASS;
        this._host = process.env.EMAIL_HOST;
        this._port = Number.parseInt(process.env.EMAIL_PORT, 10);
        this._layoutPath = process.env.LAYOUT_PATH;
    }
    getFrom() {
        return this._from;
    }
    getEmail() {
        return this._email;
    }
    getUser() {
        return this._user;
    }
    getPassword() {
        return this._password;
    }
    getHost() {
        return this._host;
    }
    getLayoutPath() {
        return this._layoutPath;
    }
    getPort() {
        return this._port;
    }
}
exports.MailConfig = MailConfig;

//# sourceMappingURL=mail-config.js.map
