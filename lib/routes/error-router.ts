import { Request, Response, NextFunction, Application } from 'express'
import { APIError } from '../services/api-error'

export class ErrorHandler {
  handleError ( app: Application ): Application {
    // error handlers

    // development error handler
    // will print stacktrace
    if ( app.get( 'env' ) === 'development' ) {
      app.use( function ( err: any, req: Request, res: Response, next: NextFunction ) {
        let _err: APIError
        if ( err instanceof APIError ) {
          _err = err
        } else {
          _err = new APIError( err.message || err, err.status || err.statusCode || 500, null, err.stack )
        }
        return res.status( _err.statusCode ).json( _err.output )
      } )
    } else {
			/**
			 * production error handler, melhorar os logs de producao em uma sprint futura
			 * // TODO - melhorar os logs de producao
			 */
      app.use( function ( err: any, req: Request, res: Response, next: NextFunction ) {
        let _err: APIError
        if ( err instanceof APIError ) {
          _err = err
        } else {
          _err = new APIError( err.message || err, err.status || err.statusCode || 500, null, err.stack )
        }
        return res.status( _err.statusCode ).json( _err.output )
      } )
    }
    return app
  }
}
