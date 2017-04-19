import { IBaseUser } from '../interfaces'
import { Request, Response } from 'express'
import { APIError, ServiceLib } from '../services'
import { AppConfig } from '../config/app-config'
import * as Bluebird from 'bluebird'
// import { Passport } from 'passport'
import * as jwt from 'jsonwebtoken'
import * as JSData from 'js-data'
import * as _ from 'lodash'
const ExtractJwt = require( 'passport-jwt' ).ExtractJwt
const Strategy = require( 'passport-jwt' ).Strategy

export const passportJwt = ( store: JSData.DataStore, passport: any, appConfig: AppConfig ): any => {
  let params = {
    secretOrKey: appConfig.getJwtConfig().secret,
    jwtFromRequest: ExtractJwt.fromAuthHeader()
  }

  passport.use( new Strategy( params, ( token: any, done: Function ) => {
    store.findAll( appConfig.getUsersTable(), { where: { id: token.id } } )
      .then(( users: IBaseUser[] ) => {
        if ( !users.length ) {
          throw new APIError( 'Usuário não encontrado', 401 )
        }
        let user = users[ 0 ]

        if ( !user.active ) {
          throw new APIError( 'Cliente ou usuário desabilitado', 401 )
        } else {
          let u = user
          u.isAdmin = u.companyAlias === appConfig.getMainCompany()
          return done( null, {
            id: u.id,
            name: u.name,
            companyAlias: u.companyAlias,
            email: u.email,
            username: u.username,
            isAdmin: u.isAdmin
          } )
        }
      } )
      .catch(( e: Error ) => done( null, false, e.message ) )
  } ) )

  passport.serializeUser(( user: IBaseUser, done: Function ) => {
    return done( null, user )
  } )
  passport.deserializeUser(( user: IBaseUser, done: Function ) => {
    return done( null, user )
  } )
  return passport
}

export const jwtGenerator = ( store: JSData.DataStore, appConfig: AppConfig ) => ( req: Request, res: Response, next: Function ): Promise<Response> => {
  let { email, password } = req.body
  if ( email && password ) {
    let options = {
      where: {
        email: email
      }
    }
    return store.findAll( appConfig.getUsersTable(), options )
      .then(( users: Array<IBaseUser> ) => {
        let user: IBaseUser = _.head( users )
        if ( !user ) {
          throw new APIError( 'O usuário não foi encontrado', 401 )
        } else if ( !user.active ) {
          throw new APIError( 'A conta foi desativada', 401 )
        }
        let userParsed: any = JSON.parse( JSON.stringify( user ) )
        return Bluebird.all( [ userParsed, ServiceLib.comparePassword( password, userParsed.password ) ] )
      } )
      .then(( resp: any ) => {
        let user: IBaseUser = resp[ 0 ]
        let encryptedPassword: boolean = resp[ 1 ]
        if ( encryptedPassword ) {
          delete user.password
          let days: string = appConfig.getExpirationDays() ? appConfig.getExpirationDays().toString( 10 ) : '3'
          return res.status( 200 ).json( `JWT ${jwt.sign( user, appConfig.getJwtConfig().secret, { expiresIn: `${days} days` } )}` )
        }
        throw new APIError( 'Senha inválida', 401 )
      } )
      .catch(( err: Error ) => {
        return next(err)
      } )
  } else {
    throw new APIError( 'Invalid fields', 401 )
  }
}
