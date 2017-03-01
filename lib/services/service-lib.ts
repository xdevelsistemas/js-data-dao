import { AppConfig } from '../config/app-config'
import * as shortid from 'shortid'
import * as EmailValidator from 'email-validator'
import { APIError } from '../services/api-error'
import * as crypto from 'crypto'
/**
 * shortid config chars
 */
shortid.characters( '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@' )

/**
 * Classe com metodos auxiliares genéricos utilizados em outras classes
 * muitas dessas classes estão disponiveis para atender funcoes de criptografia.
 *
 * Ela deve ser aplicada dentro da lib em uma aplicação definida, e com a configuração feita
 * a unica exigencia na configuracao para plena execucao dessa lib é a configuracao de algoritmo de criptografia, que é necessário para geracao de
 * tokens dos convites de usuários no sistema utilizado nas tecnicas de signup e forgot.
 *
 * @export
 * @class ServiceLib
 */
export class ServiceLib {

  config: AppConfig

  /**
   * Creates an instance of ServiceLib.
   *
   * Essa instancia depende somente da configuracao setada na aplicacao que é encapsulado no appConfig
   * @param {AppConfig} config
   *
   * @memberOf ServiceLib
   */
  constructor ( config: AppConfig ) {
    this.config = config

  }

  /**
   * Gera id (usando algoritmo shortid).
   *
   * Usamos ele por gerar strings menores que o uuid e ter chance de colisão pequena ( podemos gerar mais de 3M por dia)
   * @returns {string} retorna id gerada
   */
  static generateId () {
    return shortid.generate()
  }

  /**
   * Valida por regexp se o email é válido
   *
   * @param {string} email email a ser validado
   * @returns {boolean} verdadeiro se o email for valido
   */
  static emailValidator ( email: string ): boolean {
    return EmailValidator.validate( email )
  }

  /**
   *
   *  Gera a hash da string definida em password
   *
   *  a saida é assincrona
   * @static
   * @param {string} password  entrada
   * @returns {Promise<string>} saida criptografada dentro de uma promise
   *
   * @memberOf ServiceLib
   */
  static hashPassword ( password: string ): string {
    return crypto.createHash('sha1').update(password).digest('hex')
  }

  /**
   * Analisa se a senha é valida sem necessidade de descriptografar a senha armazenada
   * no sistema.
   * @static
   * @param {string} password  valor plano ( nao criptografado ) a ser analisado
   * @param {string} encryptedPassword valor armazenado no banco que foi criptografado
   * @returns {boolean} retorna verdadeiro se bater
   *
   * @memberOf ServiceLib
   */
  static comparePassword ( password: string, encryptedPassword: string ): boolean {
    return ( crypto.createHash('sha1').update(password).digest('hex') === encryptedPassword)
  }

  /**
   * A partir da configuracao definida na aplicacap pelo appConfig teremos o algoritmo que será
   * usado na criptografia, a mesma será usado na volta na hora de recuperar o valor.
   *
   * Nos projetos é encontrado no algoritmo para gerar token de primeiro login e recuperacao de senhas
   * @param {string} text  texto a ser aplicado criptografia
   * @returns {string} texto criptografado
   *
   * @memberOf ServiceLib
   */
  encrypt ( text: string ): string {
    let cipher = crypto.createCipher( this.config.getCryptoAlgorithm(), this.config.getCryptoPassword() )
    let crypted = cipher.update( text, 'utf8', 'hex' )
    crypted += cipher.final( 'hex' )
    return crypted
  }

  /**
   * Semelhante ao algoritmo citado em encrypt mas aqui ele recupera o valor que foi criptografado usando
   * a configuracao da aplicacao.
   * @param {string} text texto a ser descriptografado
   * @returns {string} texto descriptografado ( pode ser um objeto no qual deve aplicar JSON.parse para transformar de string para objeto)
   *
   * @memberOf ServiceLib
   */
  decrypt ( text: string ): string {
    try {
      let decipher = crypto.createDecipher( this.config.getCryptoAlgorithm(), this.config.getCryptoPassword() )
      let dec = decipher.update( text, 'hex', 'utf8' )
      dec += decipher.final( 'utf8' )
      return dec
    } catch ( e ) {
      throw new APIError( 'token inválido', 401 , {message : e.message})
    }
  }

  /**
   * Usando o algoritmo de criptografia criamos o token com email e data de expiracao do convite.
   *
   * Usado nas rotas de signup e recuperar senha, ele tem versatilidade de definir a data de expiracao.
   * @param {string} email email , inicialmente projetado para criptografar somente email , pode ser colocado vazio se voce colocar um customData pra substituir
   * @param {Date} expireDate data de expiracao do token, se nao informar, será considerado a data do dia vigente na geracao do token como validade
   * @param {*} customData caso queira criptografar no token um tipo de dado diferente, pode customizar usando customData que ele irá sobrepor sobre o objeto data quer irá ser criptografado
   * @returns {string}
   *
   *
   * @memberOf ServiceLib
   */
  generateToken ( email: string, expireDate?: Date, customData?: any ): string {
    let data: any = customData || {
      email,
      expiration: expireDate || new Date()
    }
    // Expire on confg days
    data.expiration.setDate( data.expiration.getDate() + this.config.getExpirationDays() )
    return this.encrypt( JSON.stringify( data ) )
  }
}
