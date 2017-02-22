export class MailConfig {
  private _from: string
  private _email: string
  private _user: string
  private _password: string
  private _host: string
  private _port: number
  private _layoutPath: string

  constructor () {
    this._from = process.env.EMAIL_FROM
    this._email = process.env.EMAIL_NAME
    this._user = process.env.EMAIL_USER
    this._password = process.env.EMAIL_PASS
    this._host = process.env.EMAIL_HOST
    this._port = Number.parseInt(process.env.EMAIL_PORT, 10)
    this._layoutPath = process.env.LAYOUT_PATH
  }

  getFrom (): string {
    return this._from
  }

  getEmail (): string {
    return this._email
  }

  getUser (): string {
    return this._user
  }

  getPassword (): string {
    return this._password
  }

  getHost (): string {
    return this._host
  }

  getLayoutPath (): string {
    return this._layoutPath
  }

  getPort (): number {
    return this._port
  }
}
