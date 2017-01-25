"use strict";
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs-extra-promise");
class SendMail {
    constructor(mailConfig) {
        this.mailConfig = mailConfig;
        const options = {
            host: this.mailConfig.getHost(),
            port: this.mailConfig.getPort(),
            auth: {
                user: this.mailConfig.getUser(),
                pass: this.mailConfig.getPassword()
            }
        };
        this.transporter = nodemailer.createTransport(smtpTransport(options));
    }
    sendForgotEmail(name, email, url) {
        return this.generateHtml(name, email, url, TpEMail.forgot).then((html) => {
            return this.sendMail(email, 'Recuperação de senha', html);
        });
    }
    sendConfirmationEmail(email, url) {
        return this.generateHtml('', email, url, TpEMail.confirmation).then((html) => {
            return this.sendMail(email, 'Confirmação de Cadastro', html);
        });
    }
    sendMail(to, subject, html) {
        const options = {
            // from === nome da empresa
            from: `${this.mailConfig.getFrom()} <${this.mailConfig.getEmail()}>`,
            // para quem o email será enviado
            to,
            // assunto do email
            subject,
            // corpo do email
            html
        };
        return this.transporter.sendMail(options);
    }
    generateHtml(name, email, url, type) {
        let chooseTemplate = (t) => {
            if (t === TpEMail.confirmation) {
                return path.join(this.mailConfig.getLayoutPath(), `confirmation.hbs`);
            }
            else {
                return path.join(this.mailConfig.getLayoutPath(), `forgot.hbs`);
            }
        };
        return fs.readFileAsync((chooseTemplate(type)), 'utf-8')
            .then((html) => {
            let template = handlebars.compile(html);
            let result = template({ name: name, email: email, url: url });
            return result;
        });
    }
}
exports.SendMail = SendMail;
var TpEMail;
(function (TpEMail) {
    TpEMail[TpEMail["confirmation"] = 0] = "confirmation";
    TpEMail[TpEMail["forgot"] = 1] = "forgot";
})(TpEMail = exports.TpEMail || (exports.TpEMail = {}));

//# sourceMappingURL=sendmail.js.map
