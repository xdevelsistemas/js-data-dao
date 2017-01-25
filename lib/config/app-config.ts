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

    constructor() {
        this._mainCompany = process.env.MAIN_COMPANY
        this._isProd = (process.env.NODE_ENV === 'production')
        this._cryptoAlgorithm = process.env.CRYPTO_ALGORITHM || 'aes192'
        this._cryptoPassword = process.env.CRYPTO_PASSWORD
        this._expirationDays = Number.parseInt(process.env.EXPIRATION_DAYS, 10) || 3
        this._usersTable = process.env.USERS_TABLE || 'users'
        this._jwtConfig = {
            strategy: 'jwt',
            secret: process.env.APP_JWT_SECRET,
            session: { session: (process.env.APP_JWT_SESSION || false as boolean) }
        }
        this.mailConfig = new MailConfig()
        this.dbConfig = new DatabaseConfig()
    }

    getMainCompany(): string {
        return this._mainCompany
    }

    getIsProd(): boolean {
        return this._isProd
    }

    getCryptoAlgorithm(): string {
        return this._cryptoAlgorithm
    }

    getCryptoPassword(): string {
        return this._cryptoPassword
    }

    getExpirationDays(): number {
        return this._expirationDays
    }

    getUsersTable(): string {
        return this._usersTable
    }

    getJwtConfig(): any {
        return this._jwtConfig
    }
}
