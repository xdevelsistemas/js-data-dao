import { AppConfig } from '../config/app-config'
import { Response, NextFunction } from 'express'
export const authenticate: Function = ( passport: any, appConfig: AppConfig ) => ( req: any, res: Response, next: NextFunction ) => {
  /**
   * http://passportjs.org/docs#custom-callback
   * casos de erros de autenticação:
   * - err com valor
   * - user como falso
   * - err com valor e user como falso
   */
  return passport.authenticate( appConfig.getJwtConfig().strategy, appConfig.getJwtConfig().session,
    ( err: any, user: any, info: any ) => {
      if ( err || !user ) {
        /**
         * prioridade maior para mensagem do erro é envio do classificador do erro e depois
         * os detalhes da mensagem de erro.
         * futuramente terá um fluxo normalizado dos tipos de erros
         */
        return res.status( 401 ).json( info.name || info.message || info || err )
      } else {
        req.user = user
        return next()
      }
    } )( req, res, next )
}
