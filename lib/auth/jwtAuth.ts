import { Passport } from 'passport'
import { AppConfig } from '../config/app-config'

export const authenticate: Function = (passport: Passport, appConfig: AppConfig) => {
    return passport.authenticate(appConfig.getJwtConfig().strategy, appConfig.getJwtConfig().session)
}
