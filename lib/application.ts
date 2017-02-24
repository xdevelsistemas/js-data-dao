import * as JSData from 'js-data'
import { Request, Response } from 'express'
import * as express from 'express'
import * as logger from 'morgan'
import * as cookieParser from 'cookie-parser'
import * as bodyParser from 'body-parser'
const passport = require('passport')
/**
 * Passport
 */
import * as Auth from './auth'
import * as Config from './config'
import * as Services from './services'
export class Application {
  app: express.Application
  store: JSData.DataStore
  passport: any
  appConfig: Config.AppConfig

  routes: (app: express.Application, store: JSData.DataStore, passport: any, appConfig: Config.AppConfig) => express.Application

  constructor (cfg: Config.AppConfig, routes: (app: express.Application, store: JSData.DataStore, passport: any, appConfig: Config.AppConfig) => express.Application) {
    this.app = express()
    this.appConfig = cfg
    /**
     * Chamando os Handlers
     */
    this.routes = routes
    this.passport = passport
    this.app = this.handleParsers(this.app)
    this.app = this.handleLogs(this.app)
    this.app = this.handleEnableCORS(this.app)
    this.store = this.handleJSData()
    this.app = this.handlePassport(this.app, this.store, this.passport)
    this.app = this.handleRoutes(this.app, this.store, this.passport)
    this.app = this.handleError(this.app)
  }

  handleParsers (app: express.Application): express.Application {
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(cookieParser())
    return app
  }

  handleLogs (app: express.Application): express.Application {
    app.use(logger('dev'))
    return app
  }

  handleEnableCORS (app: express.Application): express.Application {
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', process.env.CORSALLOWED || '*')
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type,' +
        ' Accept, Authorization, If-Modified-Since, Cache-Control, Pragma')
      if ('OPTIONS' === req.method) {
        return res.send(200)
      } else {
        return next()
      }
    })
    return app
  }

  /**
   * adiciona a view engine
   * middleware responsavel pelo processamento da view que atualmente utilizamos ejs
   *
   *
   */
  handleJSData (): JSData.DataStore {
    /**
     * Definindo o adaptador JSData para o projeto
     */
    const store: JSData.DataStore = new JSData.DataStore()
    store.registerAdapter(this.appConfig.dbConfig.getDatabase(),
      this.appConfig.dbConfig.getAdapter(),
      this.appConfig.dbConfig.getAdapterOptions()
    )
    return store
  }

  handlePassport (app: express.Application, store: JSData.DataStore, passport: any): express.Application {
    // required for passport
    this.passport = Auth.passportJwt(store, passport, this.appConfig)
    app.use(this.passport.initialize())
    return app
  }

  handleRoutes (app: express.Application, store: JSData.DataStore, passport: any): express.Application {
    /**
     * chamada no index para chamar todas as rotas
     */
    app = this.routes(app, store, passport, this.appConfig)
    // catch 404 and forward to error handler
    app.use((req: Request, res: Response, next: Function) => {
      let err: any = new Error('Not Found')
      err.status = 404
      next(err)
    })
    return app
  }

  handleError (app: express.Application): express.Application {
    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
      app.use(function (err: any, req: Request, res: Response, next: Function) {
        if (!(err instanceof Services.APIError)) {
          err = new Services.APIError(err, err.status || err.statusCode || 500)
        }
        res.status(err.statusCode).json(err.error)
      })
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function (err: any, req: Request, res: Response, next: Function) {
      if (!(err instanceof Services.APIError)) {
        err = new Services.APIError(err, err.status || err.statusCode || 500)
      }
      res.status(err.statusCode).json(err.error)
    })
    return app
  }
}
