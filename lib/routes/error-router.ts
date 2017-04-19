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
					_err = new APIError( err, err.status || err.statusCode || 500, null )
				}
				return res.status( _err.statusCode ).json( _err )
			} )
		} else {
			// production error handler
			// no stacktraces leaked to user
			app.use( function ( err: any, req: Request, res: Response, next: NextFunction ) {
				let _err: APIError
				if ( !( err instanceof APIError ) ) {
					_err = new APIError( err, err.status || err.statusCode || 500 )
				}
				return res.status( _err.statusCode >= 100 && _err.statusCode < 600 ? _err.statusCode : 500 ).json( _err.output )
			} )
		}
		return app
	}
}
