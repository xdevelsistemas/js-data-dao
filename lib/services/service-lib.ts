import {AppConfig} from '../config/app-config'
import * as shortid from 'shortid'
import * as _ from 'lodash'
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

    /**
     * O 'obj' terá seus dados validado em relação aos campos contidos em 'fields'
     * Exceto os campos contidos em 'exclude'
     *
     * @param {*} obj
     * @param {Array<string>} fields
     * @param {Array<string>} [exclude=[]]
     * @returns {Boolean}
     *
     */
    static validateFields(obj: any, fields: Array<string>, exclude: Array<string> = []): boolean {
        let allCorrect: boolean = true

        fields.forEach(el => {
            if (_.indexOf(exclude, el) === -1) {
                allCorrect = allCorrect && !_.isEmpty(_.toString(obj[el]))
            }
        })

        return allCorrect
    }



    static hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, bcryptjs.genSaltSync(10))
    }


    static comparePassword(password: string, encryptedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, encryptedPassword)
    }


    /**
     * Através de 'fieldsUp' um novo objeto é formado e somente os campos ditos nele serão atualizados.
     * Ou seja, permitindo que campos que não podem ser alterados fiquem seguros e inalterados na atualização.
     *
     * @param {*} obj
     * @param {Array<string>} fieldsObj
     * @param {Array<string>} fieldsUp
     * @returns {*}
     *
     */
    static fieldsUpValidator(obj: any, fieldsObj: Array<string>, fieldsUp: Array<string>): any {
        let newObj: any = {}

        fieldsUp.forEach(field => {
            if (_.indexOf(fieldsObj, field) !== -1) {
                newObj[field] = obj[field]
            }
        })

        return newObj
    }
}