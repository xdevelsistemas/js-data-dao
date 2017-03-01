import {getEnv} from './utils'
import * as path from 'path'
export class MailConfig {
  private from: string
  private email: string
  private user: string
  private password: string
  private host: string
  private port: number
  private layoutPath: string

  constructor () {
    this.from = getEnv('EMAIL_FROM')
    this.email = getEnv('EMAIL_NAME')
    this.user = getEnv('EMAIL_USER')
    this.password = getEnv('EMAIL_PASS')
    this.host = getEnv('EMAIL_HOST')
    this.port = Number.parseInt(getEnv('EMAIL_PORT'), 10)
    this.layoutPath = getEnv('LAYOUT_PATH') || path.resolve('./testResources/')
  }

  getFrom (): string {
    return this.from
  }

  getEmail (): string {
    return this.email
  }

  getUser (): string {
    return this.user
  }

  getPassword (): string {
    return this.password
  }

  getHost (): string {
    return this.host
  }

  getLayoutPath (): string {
    return this.layoutPath
  }

  getPort (): number {
    return this.port
  }
}
