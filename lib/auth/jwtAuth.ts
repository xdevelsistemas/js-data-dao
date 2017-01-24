import { Passport } from 'passport'
import { jwtConfig } from '../config/jwt'

export const authenticate: Function = (passport: Passport) => {
    return passport.authenticate(jwtConfig.strategy, jwtConfig.session)
}
