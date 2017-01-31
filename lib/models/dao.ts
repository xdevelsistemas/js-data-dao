import { IDAO, IResultSearch } from '../interfaces'
import { APIError } from '../services'
import * as JSData from 'js-data'
import { IBaseUser } from '../interfaces/ibase-user'
import { IBaseModel } from '../interfaces/ibase-model'
import * as _ from 'lodash'

export class DAO<T extends IBaseModel> implements IDAO<T> {
  public collection: JSData.Mapper
  public schema: JSData.Schema
  public collectionName: string
  public opts: any

  constructor(store: JSData.DataStore, collectionName: string, schema: any = null, relations: any = null, joins: string[] = []) {
    if (!store) {
      throw Error('classe não instanciada corretamente')
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
        type: 'string'
      }
    }

    if (schema) {
      let mainSchemaRequireds: string[] = ['id', 'active', 'createdAt']
      let newSchemaRequireds = (schema.required && Array.isArray(schema.required) && schema.required.length > 0) ? _.union(schema.required, mainSchemaRequireds) : mainSchemaRequireds
      let newSchemaProperties = Object.assign({}, mainSchemaProperties, schema.properties)
      let objSchema = {
        title: schema.title || this.collectionName,
        description: schema.description || 'please add description',
        type: schema.type || 'object',
        properties: newSchemaProperties,
        required: newSchemaRequireds
      }
      this.schema = new JSData.Schema(objSchema)
    }
    this.collectionName = collectionName
    try {
      this.collection = store.getMapper(collectionName)
    } catch (e) {
      let opts: any = {}
      if (schema) {
        opts.schema = this.schema
      }
      if (relations) {
        opts.relations = relations
      }
      this.collection = store.defineMapper(collectionName, opts)
    }

    this.opts = {
      with: joins,
      debug: true
    }
  }

  /**
   * busca todos os registros
   *
   * @param {Object} [query={}]
   * @param {*} user
   * @returns {Promise<Array<T>>}
   *
   * @memberOf DAO
   */
  public findAll(query: Object = {}, user: IBaseUser): Promise<Array<T>> {
    return this.collection.findAll(query, this.opts)
      .then((records: JSData.Record[]) => {
        if (records) {
          return records.map(d => d.toJSON(this.opts)) as T[]
        } else {
          return []
        }
      })
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
  public find(id: string, user: IBaseUser): Promise<T> {
    return this.collection.find(id, this.opts)
      .then((record: JSData.Record) => {
        if (record) {
          return record.toJSON(this.opts) as T
        } else {
          return null
        }
      })
  }

  /**
   * create registro
   *
   * @param {T} obj
   * @param {*} user
   * @returns {Promise<T>}
   *
   * @memberOf DAO
   */
  public create(obj: T, userP: any): Promise<T> {
    return this.collection.create(obj)
      .then((record: JSData.Record) => {
        return record.toJSON(this.opts)
      })
      .catch((reject: JSData.SchemaValidationError) => {
        throw new APIError('erro de entrada', 400, reject)
      })
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
  public update(id: string, user: IBaseUser, obj: T): Promise<T> {
    return this.collection.update(id, obj)
      .then((record: JSData.Record) => {
        return record.toJSON(this.opts) as T
      })
      .catch((reject: JSData.SchemaValidationError) => {
        throw new APIError('erro de entrada', 400, reject)
      })
  }

  /**
   * delete registro
   *
   * @param {string} id
   * @param {*} user
   * @returns {Promise<boolean>}
   *
   * @memberOf DAO
   */
  public delete(id: string, user: IBaseUser): Promise<boolean> {
    return this.collection.destroy(id)
      .then(() => true)
      .catch(() => false)
  }

  /**
   * realize search query using limits and page control
   *
   * @param {Object} search
   * @param {*} user
   * @param {number} [page]
   * @param {number} [limit]
   * @param {Array<string>} [order]
   * @returns {Promise<IResultSearch<T>>}
   *
   * @memberOf DAO
   */
  paginatedQuery(
    search: Object, user: IBaseUser, page?: number, limit?: number, order?: Array<string>, options?: any): Promise<IResultSearch<T>> {
    let _page: number = page || 1
    let _limit: number = limit || 10
    let _order: string[] = []
    let params = Object.assign({}, search, {
      orderBy: _order,
      offset: _limit * (_page - 1),
      limit: _limit
    })

    return this.collection.findAll(search)
      .then((countResult) => {
        return this.collection.findAll(params, options || this.opts)
          .then((results: JSData.Record[]) => {
            return {
              page: _page,
              total: countResult.length,
              result: results.map(d => d.toJSON(options || this.opts))
            } as IResultSearch<T>
          })
      })
  }

}
