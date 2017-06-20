import {getEnv} from './utils'
import { DatabaseConfig } from './database-config'
import { MailConfig } from './mail-config'
/**
 * This class have all application config
 * If necessary add more configuration, please inherit the class and add more config
 */
export class AppConfig {
  public mailConfig: MailConfig
  public dbConfig: DatabaseConfig
  private _mainCompany: string
  private _isProd: boolean
  private _cryptoAlgorithm: string
  private _cryptoPassword: string
  private _expirationDays: number
  private _jwtConfig: any
  private _usersTable: string
  private _signUpUrl: string
  private _forgotUrl: string

  private _corsAllowed: string
  private _corsAllowMethods: string
  private _corsAllowHeaders: string

  constructor () {
    this._corsAllowed = getEnv('CORSALLOWED') || '*'
    this._corsAllowMethods = getEnv('CORS_ALLOW_METHODS') || 'GET,PUT,POST,DELETE,OPTIONS,PATCH'
    this._corsAllowHeaders = getEnv('CORS_ALLOW_HEADERS') || 'Origin, X-Requested-With, Content-Type, Accept, Authorization, If-Modified-Since, Cache-Control, enctype, Pragma'
    this._mainCompany = getEnv('MAIN_COMPANY')
    this._isProd = ( getEnv('NODE_ENV') === 'production' )
    this._cryptoAlgorithm = getEnv('CRYPTO_ALGORITHM') || 'aes192'
    this._cryptoPassword = getEnv('CRYPTO_PASSWORD')
    this._expirationDays = Number.parseInt( getEnv('EXPIRATION_DAYS'), 10 ) || 3
    this._usersTable = getEnv('USERS_TABLE') || 'users'
    this._signUpUrl = getEnv('SIGNUP_URL') || 'http://foo.bar/auth/signup'
    this._forgotUrl = getEnv('FORGOT_URL') || 'http://foo.bar/auth/forgot'
    this._jwtConfig = {
      strategy: 'jwt',
      secret: getEnv('APP_JWT_SECRET'),
      session: { session: ( getEnv('APP_JWT_SESSION') || false ) as boolean }
    }
    this.mailConfig = new MailConfig()
    this.dbConfig = new DatabaseConfig()

  }

  get mainCompany (): string {
    return this._mainCompany
  }

  get isProd (): boolean {
    return this._isProd
  }

  get cryptoAlgorithm (): string {
    return this._cryptoAlgorithm
  }

  get cryptoPassword (): string {
    return this._cryptoPassword
  }

  get expirationDays (): number {
    return this._expirationDays
  }

  get usersTable (): string {
    return this._usersTable
  }

  get jwtConfig (): any {
    return this._jwtConfig
  }

  get signUpUrl (): string {
    return this._signUpUrl
  }

  get forgotUrl (): string {
    return this._forgotUrl
  }

  get corsAllowed (): string {
    return this._corsAllowed
  }
  get corsAllowMethods (): string {
    return this._corsAllowMethods
  }

  get corsAllowHeaders (): string {
    return this._corsAllowHeaders
  }

}
