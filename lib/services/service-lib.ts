import { AppConfig } from '../config/app-config'
import * as shortid from 'shortid'
import * as EmailValidator from 'email-validator'
/**
 * passwordCrypto
 */
const bcrypt = require('bcrypt-then')
const bcryptjs = require('bcryptjs')
/**
 * Cripto
 */
const crypto = require('crypto')
/**
 * shortid config chars
 */
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@')

export class ServiceLib {

  config: AppConfig

  constructor(config: AppConfig) {
    this.config = config

  }

  /**
   * Gera id
   * @returns {string}
   */
  static generateId() {
    return shortid.generate()
  }

  /**
   * is valid email?
   *
   * @param {string} email
   * @returns {boolean}
   */
  static emailValidator(email: string): boolean {
    return EmailValidator.validate(email)
  }

  static hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, bcryptjs.genSaltSync(10))
  }

  static comparePassword(password: string, encryptedPassword: string): boolean {
    return bcrypt.compare(password, encryptedPassword)
  }

  encrypt(text: string) {
    let cipher = crypto.createCipher(this.config.getCryptoAlgorithm(), this.config.getCryptoPassword())
    let crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex')
    return crypted
  }

  decrypt(text: string) {
    let decipher = crypto.createDecipher(this.config.getCryptoAlgorithm(), this.config.getCryptoPassword())
    let dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8')
    return dec
  }

  generateToken(email: string): string {
    let data: any = {
      email,
      expiration: new Date()
    }
    // Expire on confg days
    data.expiration.setDate(data.expiration.getDate() + this.config.getExpirationDays())
    return this.encrypt(JSON.stringify(data))
  }
}
