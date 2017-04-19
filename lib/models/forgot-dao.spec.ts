import { AppConfig } from '../config'
import { ForgotDAO } from './forgot-dao'
import { DAO } from './dao'
import {BaseModel} from './base-model'
import { IBaseUser } from '../interfaces'
import * as assert from 'assert'
import * as chai from 'chai'
import * as JSData from 'js-data'
chai.should()
/**
 * preparando testabililidade do ambiente
 */
/**
 * criando o ambiente testável
 */
let config = new AppConfig()
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

export class TestUser extends BaseModel implements IBaseUser {
  name: string
  companyAlias: string
  email: string
  username: string
  password: string
  isAdmin: boolean

  constructor ( obj: IBaseUser ) {
    super( obj )
    this.name = obj.name
    this.companyAlias = obj.companyAlias || obj.email
    this.email = obj.email
    this.password = obj.password
    this.isAdmin = obj.isAdmin
    this.active = obj.active === undefined ? true : obj.active
    this.username = obj.username || obj.email
  }
}
export class TestUserDAO extends DAO<IBaseUser> {
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
    super(store, TestUser , appConfig.getUsersTable(), schema)
  }
}

let store: JSData.DataStore = handleJSData(config)
let userDAO = new TestUserDAO(store,config)
const dao = new ForgotDAO(config,userDAO)

describe('ServiceLib', () => {

  it('A classe é instanciável?', () => {
    assert(dao instanceof ForgotDAO)
  })
})
