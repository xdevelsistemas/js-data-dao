import { PersistRouter } from './'
import { TestSimpleClassDAO, ITestSimpleClass } from '../models/dao.spec'
import { TestController } from '../controllers/base-persist-controller.spec'
import { AppConfig } from '../config'
import * as JSData from 'js-data'
import * as chai from 'chai'
import * as assert from 'assert'
import * as chaiAsPromised from 'chai-as-promised'
import * as express from 'express'
import * as request from 'supertest'
import * as bodyParser from 'body-parser'
import { ErrorHandler } from './error-router'
chai.use( chaiAsPromised )
chai.should()

let app = express()
app.use( bodyParser() )

export class TestRouter extends PersistRouter<ITestSimpleClass, TestController> {
}

/**
 * criando o ambiente testável
 */
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

let store: JSData.DataStore = handleJSData( config )
let dao = new TestSimpleClassDAO( store, config )
let ctrl = new TestController( dao )

let router = new TestRouter( store, ctrl )

/**
 * create api/v1/test router for CRUD operation
 */

app.use( '/api/v1/test', router.getRouter() )
new ErrorHandler().handleError( app )

/**
 * inicio dos testes
 */

describe( 'Persist Router Basic', () => {
  it( 'Controller é Instanciável ?', () => {
    assert( router instanceof TestRouter )
  } )
} )

describe( 'Criando ambiente testavel para aplicar CRUD na persistencia', () => {
  let resp: ITestSimpleClass = null
  it( 'Create ?', ( done: Function ) => {
    request( app )
      .post( '/api/v1/test' )
      .send( { name: 'test' } ).expect( 201 )
      .then(( response ) => {
        resp = response.body
      } )
      .then(() => done() )
  } )

  it( 'Find ?', ( done: Function ) => {
    request( app )
      .get( `/api/v1/test/${resp.id}` )
      .expect( 200, done )
  } )

  it( 'Update ?', ( done: Function ) => {
    request( app )
      .put( `/api/v1/test/${resp.id}` )
      .send( { name: 'zeze' } )
      .expect( 200, done )
  } )

  it( 'Query ?', ( done: Function ) => {
    request( app )
      .post( `/api/v1/test/query?limit=10&page=1` )
      .expect( 200, done )
  } )

  it( 'FindAll ?', ( done: Function ) => {
    request( app )
      .get( `/api/v1/test` )
      .expect( 200, done )
  } )

  it( 'Find invalid id ?', ( done: Function ) => {
    request( app )
      .get( `/api/v1/test/178278` )
      .expect( 404, done )
  } )

  it( 'Delete ?', ( done: Function ) => {
    request( app )
      .delete( `/api/v1/test/${resp.id}` )
      .expect( 200, done )
  } )
} )
