import { IBaseUser } from '../interfaces'
import * as Bluebird from 'bluebird'
import * as JSData from 'js-data'
import * as _ from 'lodash'
import { AppConfig } from '../config/app-config'
import { MailConfig } from '../config/mail-config'
import { ServiceLib } from '../services/service-lib'
import * as nodemailer from 'nodemailer'

export class SignUpDAO {
  storedb: JSData.DataStore
  private _mailConfig: MailConfig
  private _serviceLib: ServiceLib
  private _appConfig: AppConfig
  constructor (store: JSData.DataStore, appConfig: AppConfig, transporter?: nodemailer.Transporter) {
    this.storedb = store
    this._appConfig = appConfig
    this._mailConfig = appConfig.mailConfig
    this._serviceLib = new ServiceLib(appConfig)
  }

  /**
   * Valida o token e retorna o user com email do token
   *
   * @param {*} params
   * @returns {Promise<IBaseUser>}
   * @memberOf SignUpDAO
   */
  public validaToken (params: any): Promise<IBaseUser> {
    let tokenDecrypted: string = this._serviceLib.decrypt(params.token)
    let data: any = JSON.parse(tokenDecrypted)
    let today: Date = new Date()
    let filterUser: any = {
      where: {
        email: {
          '===': data.email
        }
      }
    }
    return this.storedb.findAll(this._appConfig.getUsersTable(), filterUser)
      .then((users: Array<IBaseUser>) => {
        let user: IBaseUser = _.head(users)
        if (_.isEmpty(user)) {
          throw 'Token inválido'
        } else if (data.expiration < today) {
          throw 'O token expirou'
        } else if (!user.active) {
          throw 'A conta foi desativada'
        }
        delete user.password
        return user
      })
  }

  /**
   * Verifica o token e cadastra a senha para o usuário
   *
   * @param {*} params
   * @param {*} obj
   * @returns {Promise<IBaseUser>}
   *
   * @memberOf SignUpDAO
   */
  public registerPassword (params: any, obj: any): Promise<boolean> {
    let data: any = JSON.parse(this._serviceLib.decrypt(params.token))
    let today: Date = new Date()
    let filterUser: any = {
      where: {
        email: {
          '===': data.email
        }
      }
    }
    return this.storedb.findAll(this._appConfig.getUsersTable(), filterUser)
      .then((users: Array<IBaseUser>) => {
        let user: IBaseUser = _.head(users)
        if (_.isEmpty(user)) {
          throw 'Token inválido'
        } else if (data.expiration < today) {
          throw 'O token expirou'
        } else if (!user.active) {
          throw 'A conta foi desativada'
        } else if (!obj.password) {
          throw 'A senha não foi definida'
        } else if (obj.password.length < 6) {
          throw 'A senha deve conter no mínimo 6 caracteres'
        }
        return Bluebird.all([
          user,
          ServiceLib.hashPassword(obj.password)
        ])
      })
      .then((resp: any) => {
        let user: IBaseUser = resp[0]
        let passwordEncrypted: string = resp[1]
        user.password = passwordEncrypted
        return this.storedb.update(this._appConfig.getUsersTable(), user.id, user)
      })
      .then(() => true)
  }
}
