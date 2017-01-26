import { AppConfig } from '../config/app-config'

export const authenticate: Function = (passport: any, appConfig: AppConfig) => {
  return passport.authenticate(appConfig.getJwtConfig().strategy, appConfig.getJwtConfig().session)
}
