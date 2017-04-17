import { DAO } from '../models/dao'
import { LoginRouter, PingRouter } from './'
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
import { authenticate } from '../auth/jwtAuth'
const Passport = require( 'passport' )
import { passportJwt } from '../auth/passport'
chai.use( chaiAsPromised )
chai.should()

const app = express()
app.use( bodyParser() )

/**
 * criando o ambiente testável
 */
process.env.APP_JWT_SECRET = 'SECRET'
let config = new AppConfig()
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

export class TestUserDAO extends DAO<IBaseUser> {
  storedb: JSData.DataStore
  constructor ( store: JSData.DataStore, appConfig: AppConfig ) {
    super( store, TestUser, 'users' )
    this.storedb = store
  }
}

let store: JSData.DataStore = handleJSData( config )
let userDAO = new TestUserDAO( store, config )
let passport = passportJwt( store, Passport, config )

let router = new LoginRouter( store, config )

/**
 * create api/v1/test router for CRUD operation
 */
app.use( passport.initialize() )
app.use( '/api/v1/login', router.getRouter() )
app.use( '/api/v1/ping', authenticate( passport, config ), new PingRouter().getRouter() )
app.use( '/api/v1/user', authenticate( passport, config ), ( req: any, res, next ) => req.user )

/**
 * inicio dos testes
 */

describe( 'Persist Router Basic', () => {
  it( 'Controller é Instanciável ?', () => {
    assert( router instanceof LoginRouter )
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
    }, null )
      .should.be.fulfilled
      .and.notify( done )
  } )
} )

describe( 'Logando com usuário', () => {
  let resp: any = null
  it( 'login', ( done: Function ) => {
    request( app )
      .post( '/api/v1/login' )
      .send( { email: 'test@test.com', password: '12345' } ).expect( 200 )
      .then(( response ) => {
        resp = response.body
      } )
      .then(() => done() )
  } )
  it( 'ping seguro autenticado', ( done: Function ) => {
    request( app )
      .get( '/api/v1/ping' )
      .set( 'Authorization', resp )
      .expect( 200, done )
  } )

  it( 'ping seguro usando token expirado', ( done: Function ) => {
    let expiredToken = `JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InJ5SzFWOTlwbCIsImFjdGl2ZSI6dHJ1ZSwiY29tcGFueUFsaWFzIjoidGVzdCIsImNyZWF0ZWRBdCI6IjIwMTctMDQtMTFUMTc6MzU6MjguNTIxWiIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImlzQWRtaW4iOnRydWUsIm5hbWUiOiJ0ZXN0IiwidXBkYXRlZEF0IjoiMjAxNy0wNC0xMVQxNzozNToyOC41MjFaIiwiaWF0IjoxNDkxOTMyMTczLCJleHAiOjE0OTE5MzIxNzN9.fQQMRtBAU-WpKo8ivsv0MDl0DnSQ9Aibl6EmgOuTTT0`
    request( app )
      .get( '/api/v1/ping' )
      .set( 'Authorization', expiredToken )
      .expect( 401, done )
  } )

  it( 'ping seguro sem autorizacao', ( done: Function ) => {
    request( app )
      .get( '/api/v1/ping' )
      .expect( 401, done )
  } )

  it( 'login inválido', ( done: Function ) => {
    request( app )
      .post( '/api/v1/login' )
      .send( { email: 'test@test.com', password: 'x' } )
      .expect( 401, done )
  } )

  it( 'campos inválidos', ( done: Function ) => {
    request( app )
      .post( '/api/v1/login' )
      .send( { x: 'test@test.com', password: 'x' } )
      .expect( 401, done )
  } )

  it( 'eliminando dados sujos', ( done: Function ) => {
    userDAO.collection.destroyAll( {} )
      .should.be.fulfilled
      .and.notify( done )
  } )
} )
