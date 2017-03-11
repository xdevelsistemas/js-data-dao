import { IBaseUser, ISignUp } from '../interfaces'
import { DAO } from './dao'
import * as JSData from 'js-data'
import * as url from 'url'
import * as moment from 'moment'
import { AppConfig } from '../config/app-config'
import { MailConfig } from '../config/mail-config'
import { ServiceLib } from '../services/service-lib'
import { APIError } from '../services/api-error'
import { SendMail } from '../services/sendmail'
import { BaseModel } from '../models/base-model'
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
  private mailConfig: MailConfig
  private sendMail: SendMail
  private serviceLib: ServiceLib
  private userDAO: DAO<IBaseUser>
  private appConfig: AppConfig
  constructor ( appConfig: AppConfig, userDao: DAO<IBaseUser>, transporter?: nodemailer.Transporter ) {
    this.appConfig = appConfig
    this.mailConfig = appConfig.mailConfig
    this.serviceLib = new ServiceLib( appConfig )
    this.sendMail = new SendMail( appConfig.mailConfig, transporter )
    this.userDAO = userDao
  }

  /**
   * Envia um email para o usuário
   *
   * @param {ISignUp} obj
   * @returns {JSData.JSDataPromise<IBaseUser>}
   *
   * @memberOf SignUpDAO
   */
  public sendSignUpMail ( obj: ISignUp, appUrl: string ): any {

    if ( !ServiceLib.emailValidator( obj.email ) ) {
      throw new APIError( 'Email inválido', 400 )
    } else {
      let token: string = this.serviceLib.generateToken( obj.email )
      return this.sendMail.sendConfirmationEmail( obj.email, url.resolve( appUrl, token ) )
    }
  }

  /**
   * Valida o token e retorna o user com email do token
   *
   * @param {*} params parametros de rota predefinidos na querystring da rota ( /signup/token => /signup/1234 => token = 1234 )
   * @returns {Promise<IBaseUser>}
   * @memberOf SignUpDAO
   */
  public validaToken ( params: any ): Promise<IBaseUser> {
    let today: Date = new Date()
    let tokenDecrypted: string = this.serviceLib.decrypt( params.token )
    try {
      let data: any = JSON.parse( tokenDecrypted )
      if ( moment( data.expiration ) < moment( today ) ) {
        throw new APIError( 'O token expirou', 401 )
      }
      return this.createEmptyUser( data.email )
    } catch ( e ) {
      throw new APIError( 'invalid token', 401, e.message )
    }
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
  public registerPassword ( params: any, obj: any, matchFilter?: Object ): Promise<IBaseUser> {
    let data: any = JSON.parse( this.serviceLib.decrypt( params.token ) )
    let today: Date = new Date()
    let filterUser: any = matchFilter || {
      where: {
        email: {
          '===': data.email
        }
      }
    }
    if ( moment( data.expiration ) >= moment( today ) ) {
      return this.userDAO.findAll( filterUser, null )
        .then(( users: Array<IBaseUser> ) => {
          let user = this.userDAO.parseModel(obj)
          user.email = data.email
          let errValidation = this.userDAO.schema.validate( user )
          if ( errValidation && errValidation.length ) {
            throw new APIError( 'Erro de entrada', 400, errValidation )
          } else if ( users.length ) {
            throw new APIError( 'Usuário existente', 401 )
          } else if ( !user.password ) {
            throw new APIError( 'A senha não foi definida', 401 )
          } else if ( user.password.length < 6 ) {
            throw new APIError( 'A senha deve conter no mínimo 6 caracteres', 401 )
          }
          user.password = ServiceLib.hashPassword( user.password )
          return this.userDAO.create( user, null )
        } )
        .then(( response ) => response )
    } else {
      throw new APIError( 'O token expirou', 401 )
    }
  }

  /**
   * metodo para criar um usuário vazio para terminar de preencher na conclusão do SignUp
   *
   * @private
   * @param {string} email email informado na entrada do signup ou quando recebe convite
   * @returns {Promise<IBaseUser>} retorna o objeto basico do usuario com os campos em branco para manter consistencia com o antigo modelo
   *
   * @memberOf SignUpDAO
   */
  private createEmptyUser ( email: string ): Promise<IBaseUser> {
    let baseData = new BaseModel()
    let returnData: any = Object.assign( {}, baseData, {
      email: email,
      isAdmin: false
    } )
    return Promise.resolve( returnData )

  }
}
