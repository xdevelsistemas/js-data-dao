import { AppConfig } from '../config'
import { SignUpDAO } from './signup-dao'
import {BaseModel} from './base-model'
import {IBaseUser} from '../interfaces'
import {DAO} from './dao'
import * as assert from 'assert'
import * as chai from 'chai'
import * as JSData from 'js-data'
import {TestUserDAO} from './forgot-dao.spec'
chai.should()
/**
 * preparando testabililidade do ambiente
 */
/**
 * criando o ambiente testável
 */
let config = new AppConfig()

export class User extends BaseModel implements IBaseUser {
  name: string
  companyAlias: string
  email: string
  username: string
  password: string
  isAdmin: boolean
  active: boolean
  constructor (obj: IBaseUser) {
    super(obj)
    this.email = obj.email
    this.password = obj.password
    this.name = obj.name
    this.email = obj.email
    this.username = obj.username
    this.active = obj.active || true
  }
}

export class UserDAO extends DAO<IBaseUser> {
  constructor (store: JSData.DataStore, appConfig: AppConfig) {
    const schema: Object = {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        companyAlias: { type: 'string' },
        email: { type: 'string' },
        username: { type: 'string' },
        password: { type: 'string' },
        isAdmin: { type: 'boolean' },
        active: { type: 'boolean' }
      },
      required: ['id', 'name', 'username', 'email', 'password', 'active']
    }
    super(store, appConfig.getUsersTable(), schema)
  }

  /**
   * Método para para facilitar a criação dos usuários
   *
   * @param {*} val
   * @returns {IUser}
   *
   * @memberOf UserDAO
   */
  public parseModel (val: any): IBaseUser {
    return new User(val)
  }
}

let handleJSData = (config: AppConfig): JSData.DataStore => {
  /**
   * Definindo o adaptador JSData para o projeto
   */
  const store: JSData.DataStore = new JSData.DataStore()
  store.registerAdapter(config.dbConfig.getDatabase(),
    config.dbConfig.getAdapter(),
    { 'default': true }
  )
  return store
}

let store: JSData.DataStore = handleJSData(config)
const dao = new SignUpDAO(config, new TestUserDAO(store,config))

describe('ServiceLib', () => {

  it('A classe é instanciável?', () => {
    assert(dao instanceof SignUpDAO)
  })
})
