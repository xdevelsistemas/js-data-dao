import { IBaseUser } from '../interfaces'
import * as Bluebird from 'bluebird'
import * as JSData from 'js-data'
import * as _ from 'lodash'
import * as moment from 'moment'
import { AppConfig } from '../config/app-config'
import { MailConfig } from '../config/mail-config'
import { ServiceLib } from '../services/service-lib'
import * as nodemailer from 'nodemailer'

/**
 * Classe responsável pelo processamento de cadastros de novos usuários no sistema
 *
 *
 * foi construido para trabalhar com seguinte fluxo:
 *
 * 1 - usuário inicia pre-cadastro enviando email;
 *
 * 1* - um usuário ativo envia convite para o email do candidato ao novo cadastro;
 *
 * 2 - depois que enviado o email, o usuário procede com cadastro entrando no hotlink e cadastrando;
 *
 * 3 - finalmente com cadastro passado por toda triagem, é enviado a resposta de ok do cadastro;
 *
 * 4 - o filtro de "unicidade" do metodo registerPassword pode ser customizado adicionando mais lógica conforme a lógica de query filter;
 *
 * @export
 * @class SignUpDAO
 */
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
        } else if (moment(data.expiration) < moment(today)) {
          throw 'O token expirou'
        } else if (!user.active) {
          throw 'A conta foi desativada'
        }
        delete user.password
        return user
      })
  }

  /**
   * Verifica o token e cadastra a senha para o usuário, utilizado no processamento do hotlink do site de cadastro
   *
   * @param {*} params parametro de entrada quando o usuario clica no hotlink do site por convite de email (exemplo:  /signup/:token => params = { token : 'conteudo'})
   * @param {*} obj objeto dos dados do usuário preenchido por um formulário ou outro meio
   * @param {Object} [matchFilter] se deseja colocar um filtro "custom" além do usual que é o de email esse campo pode ser utilizado
   * @returns {Promise<boolean>} retorna booleano indicando ok do processo
   *
   * @memberOf SignUpDAO
   */
  public registerPassword (params: any, obj: any, matchFilter?: Object): Promise<boolean> {
    let data: any = JSON.parse(this._serviceLib.decrypt(params.token))
    let today: Date = new Date()
    let filterUser: any = matchFilter || {
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
        } else if (moment(data.expiration) < moment(today)) {
          throw 'O token expirou'
        } else if (user.active !== undefined && !user.active) {
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
