import { IDAO, IResultSearch } from '../interfaces'
import { APIError } from '../services/api-error'
import * as JSData from 'js-data'
import { IBaseUser } from '../interfaces/ibase-user'
import { IBaseModel } from '../interfaces/ibase-model'
import * as _ from 'lodash'

export class DAO<T extends IBaseModel> implements IDAO<T> {
  public collection: JSData.Mapper
  public options: any

  constructor(currentModel: JSData.Mapper, joins: any[] = []) {
    if (!currentModel) {
      throw Error('classe não instanciada corretamente')
    }
    this.options = {
      with: joins
    }
    this.collection = currentModel
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
    return this.collection.findAll(query, this.options)
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
    return this.collection.find(id, this.options)
      .then((register: T) => {
        if (register.active) {
          return register
        } else {
          throw 'Registro não encontrado'
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
  public create(obj: T, user: IBaseUser): Promise<T> {
    throw new APIError('Nao implementado', 500)
    // return this.collection.create(obj)
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
    // return this.collection.destroy(id)
    //     .then(() => true)
    //     .catch(() => false)

    return this.collection.find(id)
      .then((register: T) => {
        if (_.isEmpty(register)) {
          throw 'Registro não encontrado'
        }
        let newObj: T = register
        newObj.active = false
        return this.collection.destroy(id).then(() => true)
      })
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
    search: Object, user: IBaseUser, page?: number, limit?: number, order?: Array<string>
  , options?: any): Promise<IResultSearch<T>> {
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
        return this.collection.findAll(params)
          .then((results) => {
            return {
              page: _page,
              total: countResult.length,
              result: results
            } as IResultSearch<T>
          })
      })
  }

}
