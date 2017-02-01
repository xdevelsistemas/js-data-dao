import { DAO } from '../models/dao'
import { ForgotRouter, LoginRouter } from './'
import { AppConfig } from '../config'
import * as JSData from 'js-data'
import * as chai from 'chai'
import * as assert from 'assert'
import * as chaiAsPromised from 'chai-as-promised'
import * as express from 'express'
import * as request from 'supertest'
import * as bodyParser from 'body-parser'
import { BaseModel } from '../models/base-model'
import { IBaseUser } from '../interfaces'
import { ServiceLib } from '../services/service-lib'
const Passport = require('passport')
import { passportJwt } from '../auth/passport'
const nodemailerMock = require('nodemailer-mock-transport')
import * as path from 'path'
chai.use(chaiAsPromised)
chai.should()

const app = express()
app.use(bodyParser())

/**
 * criando o ambiente testável
 */
process.env.LAYOUT_PATH = path.join(__dirname,'../../testResources')
process.env.CRYPTO_PASSWORD = 'secret'
process.env.APP_JWT_SECRET = 'SECRET'
let config = new AppConfig()
let serviceLib = new ServiceLib(config)
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

  constructor(obj: IBaseUser) {
    super(obj)
    this.name = obj.name
    this.companyAlias = obj.companyAlias
    this.email = obj.email
    this.password = obj.password
    this.isAdmin = obj.isAdmin
  }
}

export class TestUserDAO extends DAO<IBaseUser> {
  storedb: JSData.DataStore
  constructor(store: JSData.DataStore, appConfig: AppConfig) {
    super(store, 'users')
    this.storedb = store
  }

  parseModel(obj: any) {
    return new TestUser(obj)
  }

}

let store: JSData.DataStore = handleJSData(config)
let userDAO = new TestUserDAO(store, config)
let passport = passportJwt(store, Passport, config)

let router = new ForgotRouter(store, config, nodemailerMock({ foo: 'bar' }))
let loginRouter = new LoginRouter(store, config)

/**
 * create api/v1/test router for CRUD operation
 */
app.use(passport.initialize())
app.use('/api/v1/forgot', router.getRouter())
app.use('/api/v1/login', loginRouter.getRouter())

/**
 * inicio dos testes
 */

describe('Forgot Router Basic', () => {
  it('Controller é Instanciável ?', () => {
    assert(router instanceof ForgotRouter)
  })
})

describe('Preparando ambiente', () => {
  it('Limpando entidade users ?', (done: Function) => {
    userDAO.collection.destroyAll({})
      .should.be.fulfilled
      .and.notify(done)
  })
  it('Criando Usuário de exemplo ?', (done: Function) => {
    ServiceLib.hashPassword('12345').then((hash: string) => {
      return userDAO.create({
        name: 'test',
        username: 'test',
        companyAlias: 'test',
        email: 'test@test.com',
        password: hash,
        isAdmin: true
      }, null)
    }).should.be.fulfilled
      .and.notify(done)
  })
})

let token = serviceLib.generateToken('test@test.com')

describe('Recuperando login', () => {
  it('iniciando o fluxo', (done: Function) => {
    request(app)
      .post(`/api/v1/forgot`)
      .send({ email: 'test@test.com' })
      .expect(200, done)
  })

  it('clicando no link', (done: Function) => {
    request(app)
      .get(`/api/v1/forgot/${token}`)
      .expect(200, done)
  })

  it('alterando senha', (done: Function) => {
    request(app)
      .post(`/api/v1/forgot/${token}`)
      .send({ password: '123456' })
      .expect(200, done)
  })

  it('login novo', (done: Function) => {
    request(app)
      .post('/api/v1/login')
      .send({ email: 'test@test.com', password: '123456' })
      .expect(200, done)
  })

  it('eliminando dados sujos', (done: Function) => {
    userDAO.collection.destroyAll({})
      .should.be.fulfilled
      .and.notify(done)
  })
})
