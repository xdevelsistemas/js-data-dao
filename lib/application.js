"use strict";
const JSData = require("js-data");
const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const passport = require("passport");
const Auth = require("./auth");
const Services = require("./services");
class Application {
    constructor(cfg, routes) {
        this.app = express();
        this.appConfig = cfg;
        /**
         * Chamando os Handlers
         */
        this.routes = routes;
        this.passport = passport;
        this.app = this.handleParsers(this.app);
        this.app = this.handleLogs(this.app);
        this.app = this.handleEnableCORS(this.app);
        this.store = this.handleJSData();
        this.app = this.handlePassport(this.app, this.store, this.passport);
        this.app = this.handleRoutes(this.app, this.store, this.passport);
        this.app = this.handleError(this.app);
    }
    handleParsers(app) {
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(cookieParser());
        return app;
    }
    handleLogs(app) {
        app.use(logger('dev'));
        return app;
    }
    handleEnableCORS(app) {
        app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', process.env.CORSALLOWED || '*');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type,' +
                ' Accept, Authorization, If-Modified-Since, Cache-Control, Pragma');
            if ('OPTIONS' === req.method) {
                return res.send(200);
            }
            else {
                return next();
            }
        });
        return app;
    }
    /**
     * adiciona a view engine
     * middleware responsavel pelo processamento da view que atualmente utilizamos ejs
     *
     *
     */
    handleJSData() {
        /**
         * Definindo o adaptador JSData para o projeto
         */
        const store = new JSData.DS();
        store.registerAdapter(this.appConfig.dbConfig.getDatabase(), this.appConfig.dbConfig.getAdapter(), this.appConfig.dbConfig.getAdapterOptions());
        return store;
    }
    handlePassport(app, store, passport) {
        // required for passport
        this.passport = Auth.passportJwt(store, passport, this.appConfig);
        app.use(this.passport.initialize());
        return app;
    }
    handleRoutes(app, store, passport) {
        /**
         * chamada no index para chamar todas as rotas
         */
        app = this.routes(app, store, passport, this.appConfig);
        // catch 404 and forward to error handler
        app.use((req, res, next) => {
            let err = new Error('Not Found');
            err.status = 404;
            next(err);
        });
        return app;
    }
    handleError(app) {
        // error handlers
        // development error handler
        // will print stacktrace
        if (app.get('env') === 'development') {
            app.use(function (err, req, res, next) {
                if (!(err instanceof Services.APIError)) {
                    err = new Services.APIError(err, err.status || err.statusCode || 500);
                }
                res.status(err.statusCode).json(err.error);
            });
        }
        // production error handler
        // no stacktraces leaked to user
        app.use(function (err, req, res, next) {
            if (!(err instanceof Services.APIError)) {
                err = new Services.APIError(err, err.status || err.statusCode || 500);
            }
            res.status(err.statusCode).json(err.error);
        });
        return app;
    }
}
exports.Application = Application;

//# sourceMappingURL=application.js.map
