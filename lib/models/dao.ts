import { IDAO, IResultSearch } from '../interfaces'
import { APIError } from '../services'
import * as JSData from 'js-data'
import { IBaseUser } from '../interfaces/ibase-user'
import { IBaseModel } from '../interfaces/ibase-model'
import * as _ from 'lodash'

/**
 * interface que define os erros customizados de validação
 * deve ser criado uma interface separado futuramente
 * //TODO tirar do dao e deixar de forma compartilhavel na estrutura de interfaces do projeto
 * @export
 * @interface IValidateError
 * @extends {Error}
 */
export interface IValidateError extends Error {
  errors: JSData.SchemaValidationError[]
}
/**
 * Foi projetado a classe para ser operada como classe generica para ser aplicavel em qualquer classe de persistencia, de forma montar as seguintes operacoes
 *
 * - buscar todos
 * - buscar por id
 * - inserir
 * - alterar
 * - deletar
 * - fazer uma busca paginada
 *
 *
 * os metodos buscar todos ( findAll ) e query paginada (paginatedQuery) utilizam do sistema de sintaxe de query de busca do js-data, para mais detalhes de como utilizar,
 * entre no seguinte link:
 *
 * http://www.js-data.io/docs/query-syntax
 * @export
 * @abstract
 * @class DAO
 * @implements {IDAO<T>}
 * @template T
 */
export abstract class DAO<T extends IBaseModel> implements IDAO<T> {
  /**
   * propriedade que permite navegar e realizar as funcoes nativas da collection do js-data na entidade definida em T
   *
   * para mais uso consulte o link: http://api.js-data.io/js-data/3.0.0-rc.8/Mapper.html
   * @type {JSData.Mapper}
   * @memberOf DAO
   */
  public collection: JSData.Mapper
  /**
   * schema for model validation
   * the schema validate the model with json from the instantiated class
   * see more in this link http://www.js-data.io/v3.0/docs/validation
   * @type {JSData.Schema}
   * @memberOf DAO
   */
  public schema: JSData.Schema

  /**
   * name of the collecion in the store
   *
   * @type {string}
   * @memberOf DAO
   */
  public collectionName: string
  /**
   * options to define model Mapper, if set, opts is overrided by your custom options, this include
   * defaults relations to load with the register (eager loading)
   *
   * @type {*}
   * @memberOf DAO
   */
  public opts: any

  /**
   * classe da implementacao da Persistencia, ela deve ter a assinatura  do tipo
   * constructor ( obj: any ) : T  => gerando o tipo da classe generico
   *
   * @private
   *
   * @memberOf DAO
   */
  private tpClass: new ( obj: any ) => T

  /**
   * Creates an instance of DAO.
   * @param {JSData.DataStore} store
   * @param {string} collectionName
   * @param {*} [schema=null]
   * @param {*} [relations=null]
   * @param {string[]} [joins=[]]
   *
   * @memberOf DAO
   */
  constructor ( store: JSData.DataStore, tpClass: new ( obj: any ) => T, collectionName: string, schema: any = null, relations: any = null, joins: string[] = [] ) {
    if ( !store ) {
      throw Error( 'store is not defined' )
    }

    const mainSchemaProperties: Object = {
      id: {
        description: 'The unique identifier for a register',
        type: 'string'
      },
      active: {
        description: 'the register is active?',
        type: 'boolean'
      },
      createdAt: {
        description: 'date of created time',
        type: 'string'
      },
      updatedAt: {
        description: 'date of last update',
        type: [ 'string', 'null' ]
      }
    }

    if ( schema ) {
      let mainSchemaRequireds: string[] = [ 'id', 'active', 'createdAt' ]
      let newSchemaRequireds = ( schema.required && Array.isArray( schema.required ) && schema.required.length > 0 ) ? _.union( schema.required, mainSchemaRequireds ) : mainSchemaRequireds
      let newSchemaProperties = Object.assign( {}, mainSchemaProperties, schema.properties )
      let objSchema = {
        title: schema.title || this.collectionName,
        description: schema.description || 'please add description',
        type: schema.type || 'object',
        properties: newSchemaProperties,
        required: newSchemaRequireds
      }
      this.schema = new JSData.Schema( objSchema )
    }
    this.collectionName = collectionName
    try {
      this.collection = store.getMapper( collectionName )
    } catch ( e ) {
      let opts: any = {}
      if ( schema ) {
        opts.schema = this.schema
      }
      if ( relations ) {
        opts.relations = relations
      }
      this.collection = store.defineMapper( collectionName, opts )
    }

    this.opts = {
      with: joins,
      debug: false
    }

    this.tpClass = tpClass
  }

  /**
   * funcao responsável por obter o dado do objeto e parsear gerando a classe instanciada dentro do DAO
   * elementos desnecessários serão descartados e elementos necessários para geração da classe serão utilizados
   * nessa parte pode ser feito verificacoes no construtor da classe impedindo a criaçao do registro caso alguma propriedade não entre
   * em adequação com as regras do sistema.
   * por padrão ele trabalha com construtor da classe que o instancia exemplo:
   *
   *  new CarDAO = new DAO<ICar>(store, Car, 'car')
   *
   * @param obj  objeto a ser "parseado"
   */
  public parseModel ( obj: any ): T {
    return new this.tpClass( obj )
  }

  /**
   * find all registers using query syntax from js-data
   * http://www.js-data.io/v3.0/docs/query-syntax#section-filtering-where
   *
   * @param {Object} [query={}]
   * @param {*} user
   * @returns {Promise<Array<T>>}
   *
   * @memberOf DAO
   */
  public findAll ( query: Object = {}, user: IBaseUser, options?: any ): Promise<Array<T>> {
    return this.collection.findAll( query, options || this.opts )
      .then(( records: JSData.Record[] ) => {
        return records.map( d => d.toJSON( this.opts ) ) as T[]
      } )
  }

  /**
   * find register by id
   *
   * @param {string} id
   * @param {*} user
   * @returns {Promise<T>}
   *
   * @memberOf DAO
   */
  public find ( id: string, user: IBaseUser, options?: any ): Promise<T> {
    return this.collection.find( id, options || this.opts )
      .then(( record: JSData.Record ) => {
        if ( record ) {
          return record.toJSON( this.opts ) as T
        } else {
          return null
        }
      } )
  }

  /**
   * create register and return the added object
   *
   * @param {T} obj
   * @param {*} user
   * @returns {Promise<T>}
   *
   * @memberOf DAO
   */
  public create ( obj: any, userP: any, options?: any ): Promise<T> {
    try {
      return this.collection.create( this.parseModel( obj ) )
        .then(( record: JSData.Record ) => {
          return record.toJSON( options || this.opts )
        } )
        .catch(( reject: IValidateError ) => {
          if ( reject.errors ) {
            throw new APIError( reject.message, 400, reject.errors )
          } else {
            throw new APIError( 'erro de entrada', 400, reject.message )
          }
        } )
    } catch ( e ) {
      return Promise.reject( new APIError( 'Erro de implementacao da classe', 500, { message: e.message } ) )
    }
  }

  /**
   * altera registro
   *
   * @param {string} id
   * @param {T} obj
   * @param {*} user
   * @returns {Promise<T>}
   *
   * @memberOf DAO
   */
  public update ( id: string, user: IBaseUser, obj: T ): Promise<T> {
    let updatedObj = obj
    updatedObj.updatedAt = new Date().toISOString()
    return this.collection.update( id, obj )
      .then(( record: JSData.Record ) => {
        return record.toJSON( this.opts ) as T
      } )
      .catch(( reject: JSData.SchemaValidationError ) => {
        throw new APIError( 'erro de entrada', 400, reject )
      } )
  }

  /**
   * delete register and return boolean if can delete or not
   *
   * @param {string} id
   * @param {*} user
   * @returns {Promise<boolean>}
   *
   * @memberOf DAO
   */
  public delete ( id: string, user: IBaseUser ): Promise<boolean> {
    // TODO  = analisar como mostrar casos que não foram deletados pois a lib sempre está dando resolve na promise
    return this.collection.destroy( id )
      .then(( response ) => true )
  }

  /**
   * realize search query using limits and page control
   *
   * the search param is a object.
   * the documentation is located in
   * http://www.js-data.io/v3.0/docs/query-syntax#section-filtering-where
   * js-data-dao use js-data query syntax
   *
   * a priodidade dos operadores é em caso de consumo pelos parametros:
   * - 1) as propriedades descritas em search
   * - 2) as propriedades aplicadas nos parametros limit,order,page
   * caso a mesma propriedade estiver nos dois parametros como no exemplo abaixo
   *  paginatedQuery({ page : 2 } , 1 )
   * a prioridade é do page dentro do primeiro parametro para em seguida o do segundo parametro, logo será o mesmo que
   *  paginatedQuery({ } , 2 )
   * o mesmo segue para as propriedades `limit` e `order`
   * @param {Object} search
   * @param {*} user
   * @param {number} [page]
   * @param {number} [limit]
   * @param {Array<string>} [order]
   * @returns {Promise<IResultSearch<T>>}
   *
   * @memberOf DAO
   */
  public paginatedQuery (
    search: any = {}, user: IBaseUser, page?: number, limit?: number, order?: Array<string> | Array<Array<string>>, options?: any ): Promise<IResultSearch<T>> {
    let _page: number = search.page || page || 1
    let _limit: number = search.limit || limit || 10
    let _order: Array<string> | Array<Array<string>> = search.orderBy || order || []
    let params = Object.assign( {}, {
      offset: _limit * ( _page - 1 ),
      limit: _limit,
      orderBy: _order
    }, search )

    return this.collection.count( search.where || {} )
      .then(( countResult ) => {
        return this.collection.findAll( params, options || this.opts )
          .then(( results: JSData.Record[] ) => {
            return {
              page: _page,
              total: countResult.length,
              result: results.map( d => d.toJSON( options || this.opts ) )
            } as IResultSearch<T>
          } )
      } )
  }

  /**
   * Método para validar campos obrigatórios
   *
   * @param {*} obj
   * @param {string[]} [required=[]]
   * @returns {boolean}
   * @memberof DAO
   */
  public validateRequiredFields (obj: any, required: string[] = []): boolean {
    let allCorrect: boolean = true
    required.some(key => {
      const field = obj[key]
      allCorrect = !!field || _.isArray(field) || _.isBoolean(field)
      return !allCorrect
    })
    return allCorrect
  }

}
