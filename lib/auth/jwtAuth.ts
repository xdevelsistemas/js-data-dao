import { AppConfig } from '../config/app-config'
import { Request, Response, NextFunction } from 'express'
export const authenticate: Function = ( passport: any, appConfig: AppConfig ) => ( req: Request, res: Response, next: NextFunction ) => {
  return passport.authenticate( appConfig.getJwtConfig().strategy, appConfig.getJwtConfig().session,
    ( error: any, user: boolean, detail: any ) => {
      if ( user ) {
        return next( null )
      } else {
        return res.status( 401 ).json( detail.name || detail.message || detail )
      }
    } )( req, res, next )
}
