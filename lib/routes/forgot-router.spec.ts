import {TestUserDAO} from '../models/forgot-dao.spec'
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
const Passport = require( 'passport' )
import { passportJwt } from '../auth/passport'
const nodemailerMock = require( 'nodemailer-mock-transport' )
import * as path from 'path'
chai.use( chaiAsPromised )
chai.should()

const app = express()
app.use( bodyParser() )

/**
 * criando o ambiente testável
 */
process.env.LAYOUT_PATH = path.join( __dirname, '../../testResources' )
process.env.CRYPTO_PASSWORD = 'secret'
process.env.APP_JWT_SECRET = 'SECRET'
let config = new AppConfig()
let serviceLib = new ServiceLib( config )
let handleJSData = ( config: AppConfig ): JSData.DataStore => {
  /**
   * Definindo o adaptador JSData para o projeto
   */
  const store: JSData.DataStore = new JSData.DataStore()
  store.registerAdapter( config.dbConfig.getDatabase(),
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
    this.companyAlias = obj.companyAlias
    this.email = obj.email
    this.password = obj.password
    this.isAdmin = obj.isAdmin
  }
}

let store: JSData.DataStore = handleJSData( config )
let userDAO = new TestUserDAO( store, config )
let passport = passportJwt( store, Passport, config )

let router = new ForgotRouter(config,userDAO, nodemailerMock( { foo: 'bar' } ) )
let loginRouter = new LoginRouter( store, config )

/**
 * create api/v1/test router for CRUD operation
 */
app.use( passport.initialize() )
app.use( '/api/v1/forgot', router.getRouter() )
app.use( '/api/v1/login', loginRouter.getRouter() )

/**
 * inicio dos testes
 */

describe( 'Forgot Router Basic', () => {
  it( 'Controller é Instanciável ?', () => {
    assert( router instanceof ForgotRouter )
  } )
} )

describe( 'Preparando ambiente', () => {
  it( 'Limpando entidade users ?', ( done: Function ) => {
    userDAO.collection.destroyAll( {} )
      .should.be.fulfilled
      .and.notify( done )
  } )
  it( 'Criando Usuário de exemplo ?', ( done: Function ) => {
    userDAO.create( {
      name: 'test',
      username: 'test',
      companyAlias: 'test',
      email: 'test@test.com',
      password: ServiceLib.hashPassword( '12345' ),
      isAdmin: true
    }, null ).should.be.fulfilled
      .and.notify( done )
  } )

  it( 'Criando Usuário (desativado) de exemplo ?', ( done: Function ) => {
    userDAO.create( {
      name: 'test4',
      username: 'test4',
      companyAlias: 'test4',
      email: 'test4@test.com',
      password: ServiceLib.hashPassword( '12345' ),
      isAdmin: true,
      active: false
    }, null )
      .should.be.fulfilled
      .and.notify( done )
  } )
} )

let token = serviceLib.generateToken( 'test@test.com' )
let expiredToken = serviceLib.generateToken( 'test@test.com', new Date( '01-01-2000' ) )
let invalidUserToken = serviceLib.generateToken( 'test_invalid@test.com' )
let inactiveUserToken = serviceLib.generateToken( 'test4@test.com' )

describe( 'Recuperando login', () => {
  it( 'iniciando o fluxo', ( done: Function ) => {
    request( app )
      .post( `/api/v1/forgot` )
      .send( { email: 'test@test.com' } )
      .expect( 200, done )
  } )

  it( 'iniciando o fluxo (email inexistente)', ( done: Function ) => {
    request( app )
      .post( `/api/v1/forgot` )
      .send( { email: 'test_invalid@test.com' } )
      .expect( 400, done )
  } )

  it( 'iniciando o fluxo (email invalido)', ( done: Function ) => {
    request( app )
      .post( `/api/v1/forgot` )
      .send( { email: 'test_invalid_without_at_test.com' } )
      .expect( 400, done )
  } )

  it( 'clicando no link', ( done: Function ) => {
    request( app )
      .get( `/api/v1/forgot/${token}` )
      .expect( 200, done )
  } )

  it( 'clicando no link (token expirado)', ( done: Function ) => {
    request( app )
      .get( `/api/v1/forgot/${expiredToken}` )
      .expect( 401, done )
  } )

  it( 'clicando no link (token invalido)', ( done: Function ) => {
    request( app )
      .get( `/api/v1/forgot/${token + 'blablabla'}` )
      .expect( 401, done )
  } )

  it( 'clicando no link (token usuario inexistente)', ( done: Function ) => {
    request( app )
      .get( `/api/v1/forgot/${invalidUserToken}` )
      .expect( 401, done )
  } )

  it( 'clicando no link (token usuario inativado)', ( done: Function ) => {
    request( app )
      .get( `/api/v1/forgot/${inactiveUserToken}` )
      .expect( 401, done )
  } )

  it( 'alterando senha (menos de 6 caracteres)', ( done: Function ) => {
    request( app )
      .post( `/api/v1/forgot/${token}` )
      .send( { password: '12345' } )
      .expect( 401, done )
  } )

  it( 'alterando senha (vazio)', ( done: Function ) => {
    request( app )
      .post( `/api/v1/forgot/${token}` )
      .send( {} )
      .expect( 401, done )
  } )

  it( 'alterando senha (token expirado)', ( done: Function ) => {
    request( app )
      .post( `/api/v1/forgot/${expiredToken}` )
      .send( { password: '123456' } )
      .expect( 401, done )
  } )

  it( 'alterando senha (token invalido)', ( done: Function ) => {
    request( app )
      .post( `/api/v1/forgot/${token + 'blablabla'}` )
      .send( { password: '123456' } )
      .expect( 401, done )
  } )

  it( 'alterando senha (token usuario inexistente)', ( done: Function ) => {
    request( app )
      .post( `/api/v1/forgot/${invalidUserToken}` )
      .send( { password: '123456' } )
      .expect( 401, done )
  } )

  it( 'alterando senha (token de usuario inativo)', ( done: Function ) => {
    request( app )
      .post( `/api/v1/forgot/${inactiveUserToken}` )
      .send( { password: '123456' } )
      .expect( 401, done )
  } )

  it( 'alterando senha', ( done: Function ) => {
    request( app )
      .post( `/api/v1/forgot/${token}` )
      .send( { password: '123456' } )
      .expect( 200, done )
  } )

  it( 'login novo', ( done: Function ) => {
    request( app )
      .post( '/api/v1/login' )
      .send( { email: 'test@test.com', password: '123456' } )
      .expect( 200, done )
  } )

  it( 'eliminando dados sujos', ( done: Function ) => {
    userDAO.collection.destroyAll( {} )
      .should.be.fulfilled
      .and.notify( done )
  } )
} )
