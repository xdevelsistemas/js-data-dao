import { IForgot, IBaseUser } from '../interfaces'
import { ServiceLib } from '../services/service-lib'
import { SendMail } from '../services/sendmail'
import { DAO } from './dao'
import * as Bluebird from 'bluebird'
import * as JSData from 'js-data'
import * as path from 'path'
import * as _ from 'lodash'
import { AppConfig } from '../config/app-config'
import * as nodemailer from 'nodemailer'
import * as moment from 'moment'
import {APIError} from '../services/api-error'
export class ForgotDAO {
  storedb: JSData.DataStore
  private sendMail: SendMail
  private serviceLib: ServiceLib

  private userDAO: DAO<IBaseUser>
  private appConfig: AppConfig
  constructor (appConfig: AppConfig,userDao: DAO<IBaseUser>, transporter?: nodemailer.Transporter ) {
    this.appConfig = appConfig
    this.sendMail = new SendMail( appConfig.mailConfig, transporter )
    this.serviceLib = new ServiceLib( appConfig )
    this.userDAO = userDao
  }

  /**
   * Envia um email para o usuário
   *
   * @param {IForgot} obj
   * @returns {JSData.JSDataPromise<IBaseUser>}
   *
   * @memberOf ForgotDAO
   */
  public sendForgotMail ( obj: IForgot , url: string): any {

    if ( !ServiceLib.emailValidator( obj.email ) ) {
      throw new APIError('Email inválido' , 400)
    } else {
      let filterEmail: any = { where: { email: { '===': obj.email } } }
      return this.userDAO.findAll(filterEmail, null)
        .then(( users: IBaseUser[] ) => {
          if ( _.isEmpty( users ) ) {
            throw 'Usuário não encontrado'
          }
          let user: IBaseUser = _.head( users )
          let token: string = this.serviceLib.generateToken( obj.email )
          return this.sendMail.sendForgotEmail( user.name, obj.email, path.join( url, token ) )
        } )

    }
  }

  /**
   * Valida o token e retorna o user com email do token
   *
   * @param {*} params
   * @returns {JSData.JSDataPromise<IBaseUser>}
   *
   * @memberOf ForgotDAO
   */
  public validaToken ( params: any ): Promise<IBaseUser> {
    let tokenDecrypted: string = this.serviceLib.decrypt( params.token )
    let data: any = JSON.parse( tokenDecrypted )
    let today: Date = new Date()
    let filterUser: any = {
      where: {
        email: {
          '===': data.email
        }
      }
    }
    return this.userDAO.findAll( filterUser, null )
      .then(( users: Array<IBaseUser> ) => {
        let user: IBaseUser = _.head( users )
        if ( _.isEmpty( user ) ) {
          throw 'Token inválido'
        } else if ( moment( data.expiration ) < moment( today ) ) {
          throw 'O token expirou'
        } else if ( !user.active ) {
          throw 'A conta foi desativada'
        }
        delete user.password
        return user
      } )
  }

  /**
   * Verifica o token e reseta a senha do usuário
   *
   * @param {*} params
   * @param {*} obj
   * @returns {JSData.JSDataPromise<IBaseUser>}
   *
   * @memberOf ForgotDAO
   */
  public resetPassword ( params: any, obj: IBaseUser ): Promise<boolean> {
    let data: any = JSON.parse( this.serviceLib.decrypt( params.token ) )
    let today: Date = new Date()
    let filterUser: any = {
      where: {
        email: {
          '===': data.email
        }
      }
    }
    return this.userDAO.findAll( filterUser, null )
      .then(( users: Array<IBaseUser> ) => {
        let user: IBaseUser = _.head( users )
        if ( _.isEmpty( user ) ) {
          throw 'Token inválido'
        } else if ( moment( data.expiration ) < moment( today ) ) {
          throw 'O token expirou'
        } else if ( !user.active ) {
          throw 'A conta foi desativada'
        } else if ( !obj.password ) {
          throw 'A nova senha não foi definida'
        } else if ( obj.password.length < 6 ) {
          throw 'A nova senha deve conter no mínimo 6 caracteres'
        }
        return Bluebird.all( [
          user,
          ServiceLib.hashPassword( obj.password )
        ] )
      } )
      .then(( resp: any ) => {
        let user: IBaseUser = resp[ 0 ]
        let passwordEncrypted: string = resp[ 1 ]
        user.password = passwordEncrypted
        return this.userDAO.update(user.id, null, user)
      } )
      .then(() => true )
  }
}
