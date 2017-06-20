import { SignupRouter, LoginRouter } from './'
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
import { authenticate, passportJwt } from '../auth'
import { TestUserDAO } from '../models/forgot-dao.spec'
import { BasePersistController } from '../controllers'
import { PersistRouter } from '../routes'
import { ErrorHandler } from '../routes/error-router'
const nodemailerMock = require( 'nodemailer-mock-transport' )
chai.use( chaiAsPromised )
chai.should()

/**
 * criando o ambiente testável
 */
process.env.CRYPTO_PASSWORD = 'secret'
process.env.APP_JWT_SECRET = 'SECRET'
let config = new AppConfig()
let serviceLib = new ServiceLib( config )
let handleJSData = ( config: AppConfig ): JSData.DataStore => {
  /**
   * Definindo o adaptador JSData para o projeto
   */
  const store: JSData.DataStore = new JSData.DataStore()
  store.registerAdapter( config.dbConfig.database,
    config.dbConfig.adapter,
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
    this.active = obj.active
  }
}

export class TestController extends BasePersistController<TestUser> {
}

export class TestRouter extends PersistRouter<TestUser, TestController> {
}

let store: JSData.DataStore = handleJSData( config )
let userDAO = new TestUserDAO( store, config )
let ctrl = new TestController( userDAO )
let userRouter = new TestRouter( store, ctrl )
let passport = passportJwt( store, Passport, config )

let router = new SignupRouter( config, userDAO, nodemailerMock( { foo: 'bar' } ) )
let loginRouter = new LoginRouter( store, config )
const app = express()
app.use( bodyParser( { extended: true } ) )
/**
 * create api/v1/test router for CRUD operation
 */
app.use( passport.initialize() )
app.use( '/api/v1/signup', router.router )
app.use( '/api/v1/login', loginRouter.router )
app.use( '/api/v1/users', authenticate( passport, config ), userRouter.router )
new ErrorHandler().handleError( app )

describe( 'SignUp Router', () => {
  /**
   * inicio dos testes
   */
  describe( 'Signup Router Basic', () => {
    it( 'Controller é Instanciável ?', ( done: Function ) => {
      assert( router instanceof SignupRouter )
      done()
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
        name: 'test2',
        username: 'test2',
        companyAlias: 'test2',
        email: 'test2@test.com',
        password: ServiceLib.hashPassword( '12345' ),
        isAdmin: true
      }, null )
        .should.be.fulfilled
        .and.notify( done )
    } )

    it( 'Criando Usuário (desativado) de exemplo ?', ( done: Function ) => {
      userDAO.create( {
        name: 'test3',
        username: 'test3',
        companyAlias: 'test3',
        email: 'test3@test.com',
        password: ServiceLib.hashPassword( '12345' ),
        isAdmin: true,
        active: false
      }, null )
        .should.be.fulfilled
        .and.notify( done )
    } )
  } )

  let existUserToken = serviceLib.generateToken( 'test2@test.com' )
  let expiredToken = serviceLib.generateToken( 'newuser@test.com', new Date( '01-01-2000' ) )
  let inactiveUserToken = serviceLib.generateToken( 'test3@test.com' )
  let newUserToken = serviceLib.generateToken( 'newuser@test.com' )

  describe( 'Enviando email de convite', () => {
    it( 'email válido', ( done: Function ) => {
      request( app )
        .post( `/api/v1/signup` )
        .send( { email: 'teste@test.com' } )
        .expect( 200, done )
    } )

    it( 'email inválido', ( done: Function ) => {
      request( app )
        .post( `/api/v1/signup` )
        .send( { email: 'teste_at_test.com' } )
        .expect( 400, done )
    } )

  } )

  describe( 'Cadastrando login (Signup)', () => {
    let result: any = null
    let user: IBaseUser = null
    before(() => {
      return userDAO.create( Object.assign( {}, new BaseModel(), {
        name: 'inativo',
        username: 'inativo',
        email: 'inativo_teste@test.com',
        active: true,
        companyAlias: null,
        password: '8cb2237d0679ca88db6464eac60da96345513964',
        isAdmin: false
      } ), null )
        .then(( localUser: IBaseUser ) => {
          user = localUser
          return localUser
        } )
        .then(() => {
          return request( app )
            .post( '/api/v1/login' )
            .send( { email: 'inativo_teste@test.com', password: '123456' } )
        } )
        .then(( response ) => {
          result = response.body
          return user.id
        } )
        .then(() => {
          user.active = false
          return userDAO.update( user.id, null, user )
        } )
    } )
    it( 'checando token', ( done: Function ) => {
      request( app )
        .get( `/api/v1/signup/${newUserToken}` )
        .expect( 200, done )
    } )

    it( 'checando token invalido', ( done: Function ) => {
      request( app )
        .get( `/api/v1/signup/${newUserToken + 'blablabla'}` )
        .expect( 401, done )
    } )

    it( 'checando token expirado', ( done: Function ) => {
      request( app )
        .get( `/api/v1/signup/${expiredToken}` )
        .expect( 401, done )
    } )

    it( 'criando a senha (senha indefinida)', ( done: Function ) => {
      request( app )
        .post( `/api/v1/signup/${newUserToken}` )
        .send( { name: 'newuser', username: 'newuser', password: '' } )
        .expect( 401, done )
    } )

    it( 'criando a senha (senha com menos de 6 caracteres)', ( done: Function ) => {
      request( app )
        .post( `/api/v1/signup/${newUserToken}` )
        .send( { name: 'newuser', username: 'newuser', password: '123' } )
        .expect( 401, done )
    } )

    it( 'provocando problema de token invalido', ( done: Function ) => {
      request( app )
        .post( `/api/v1/signup/${existUserToken + 'blablabla'}` )
        .send( { name: 'newuser', username: 'newuser', password: '123456' } )
        .expect( 401, done )
    } )

    it( 'criando login de usuario inexistente', ( done: Function ) => {
      request( app )
        .post( `/api/v1/signup/${existUserToken}` )
        .send( { name: 'newuser', username: 'newuser', password: '123456' } )
        .expect( 401, done )
    } )

    it( 'provocando problema de token expirado', ( done: Function ) => {
      request( app )
        .post( `/api/v1/signup/${expiredToken}` )
        .send( { name: 'newuser', username: 'newuser', password: '123456' } )
        .expect( 401, done )
    } )

    it( 'provocando problema de token de usuario inativo', ( done: Function ) => {
      request( app )
        .post( `/api/v1/signup/${inactiveUserToken}` )
        .send( { name: 'inactive', username: 'inactive', password: '123456' } )
        .expect( 401, done )
    } )

    it( 'criando a senha', ( done: Function ) => {
      request( app )
        .post( `/api/v1/signup/${newUserToken}` )
        .send( { name: 'newuser', username: 'newuser', password: '123456' } )
        .expect( 200, done )
    } )

    it( 'login novo', ( done: Function ) => {
      request( app )
        .post( '/api/v1/login' )
        .send( { email: 'newuser@test.com', password: '123456' } )
        .expect( 200, done )
    } )

    it( 'realizando query com user válido', ( done: Function ) => {
      request( app )
        .post( '/api/v1/login' )
        .send( { email: 'newuser@test.com', password: '123456' } )
        .then(( result: any ) => {
          request( app )
            .get( '/api/v1/users' )
            .set( 'Authorization', result.body )
            .send( { email: 'newuser@test.com', password: '123456' } )
            .expect( 200, done )
        } )
    } )

    it( 'realizando query com user inválido', ( done: Function ) => {
      request( app )
        .get( '/api/v1/users' )
        .set( 'Authorization', 'JWT xkjjsjkasjahsjhsahjs' )
        .expect( 401, done )
    } )

    it( 'tentando fazer uma consulta com usuario inativo', ( done: Function ) => {
      request( app )
        .get( '/api/v1/users' )
        .set( 'Authorization', result )
        .expect( 401, done )
    } )

    it( 'tentando novo login com usuario inativo', ( done: Function ) => {
      request( app )
        .post( '/api/v1/login' )
        .send( { email: 'inativo_teste@test.com', password: '123456' } )
        .expect( 401, done )
    } )

    it( 'eliminando dados sujos', ( done: Function ) => {
      userDAO.collection.destroyAll( {} )
        .should.be.fulfilled
        .and.notify( done )
    } )

    it( 'testando usuario inexistente', ( done: Function ) => {
      request( app )
        .post( '/api/v1/login' )
        .send( { email: 'hjahjsahjsahjs@test.com', password: '123456' } )
        .expect( 401, done )
    } )

    it( 'consulta de dados de usuario deletado', ( done ) => {
      before(() => userDAO.delete( user.id, null ) )
      request( app )
        .get( '/api/v1/users' )
        .set( 'Authorization', result )
        .expect( 401, done )

    } )
  } )
} )
