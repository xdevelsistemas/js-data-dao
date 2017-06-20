import {getEnv} from './utils'
import * as path from 'path'
export class MailConfig {
  private _from: string
  private _email: string
  private _user: string
  private _password: string
  private _host: string
  private _port: number
  private _layoutPath: string

  constructor () {
    this._from = getEnv('EMAIL_FROM')
    this._email = getEnv('EMAIL_NAME')
    this._user = getEnv('EMAIL_USER')
    this._password = getEnv('EMAIL_PASS')
    this._host = getEnv('EMAIL_HOST')
    this._port = Number.parseInt(getEnv('EMAIL_PORT'), 10)
    this._layoutPath = getEnv('LAYOUT_PATH') || path.resolve('./testResources/')
  }

  get from (): string {
    return this._from
  }

  get email (): string {
    return this._email
  }

  get user (): string {
    return this._user
  }

  get password (): string {
    return this._password
  }

  get host (): string {
    return this._host
  }

  get layoutPath (): string {
    return this._layoutPath
  }

  get port (): number {
    return this._port
  }
}
