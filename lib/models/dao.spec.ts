import { DAO } from './dao'
import { IBaseModel, IResultSearch } from '../interfaces'
// import { GenericDeserialize } from 'cerialize'
import { BaseModel } from './base-model'
import { AppConfig } from '../config'
import * as JSData from 'js-data'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
chai.use( chaiAsPromised )
chai.should()
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
/**
 * interface needed for unit test
 * the interface constains only property name
 *
 * @interface ITestSimpeClass
 * @extends {IBaseModel}
 */
export interface ITestSimpleClass extends IBaseModel {
  name: string
}

export interface ITestComplexClass extends IBaseModel {
  name: string
  simpleClassId: string
  simpleClass?: ITestSimpleClass
}

/**
 * class for unit test
 *
 * @class TestSimpleClass
 * @extends {BaseModel}
 * @implements {ITestSimpeClass}
 */
export class TestSimpleClass extends BaseModel implements ITestSimpleClass {
  name: string

  constructor ( obj: ITestSimpleClass ) {
    super( obj )
    this.name = obj.name
  }
}

/**
 * class for unit test
 *
 * @class TestInvalidClass
 * @extends {BaseModel}
 * @implements {TestInvalidClass}
 */
export class TestInvalidClass extends BaseModel implements ITestSimpleClass {
  name: string

  constructor ( obj: ITestSimpleClass ) {
    super( obj )
    this.name = obj.name
    throw new Error('provocando erro na instanciação')
  }
}

/**
 *
 *
 * @class TestComplexClass
 * @extends {BaseModel}
 * @implements {ITestComplexClass}
 */
export class TestComplexClass extends BaseModel implements ITestComplexClass {
  name: string
  simpleClassId: string
  simpleClass?: ITestSimpleClass

  constructor ( obj: ITestComplexClass ) {
    super( obj )
    this.name = obj.name
    this.simpleClassId = obj.simpleClassId
    this.simpleClass = obj.simpleClass ? new TestSimpleClass( obj.simpleClass ) : null
  }
}

export class TestSimpleClassDAO extends DAO<ITestSimpleClass> {
  storedb: JSData.DataStore
  constructor ( store: JSData.DataStore, appConfig: AppConfig ) {
    super( store, TestSimpleClass, 'simple', {
      title: 'testSimple',
      description: 'Simple Test',
      type: 'object',
      properties: { name: { type: 'string' } },
      required: [ 'name' ]
    }, null, [] )
    this.storedb = store
  }
}
export class TestInvalidClassDAO extends DAO<TestInvalidClass> {
  storedb: JSData.DataStore
  constructor ( store: JSData.DataStore, appConfig: AppConfig ) {
    super( store, TestInvalidClass, 'simple', {
      properties: { name: { type: 'string' } }
    }, null, [] )
    this.storedb = store
  }
}

export class TestComplexClassDAO extends DAO<ITestComplexClass> {
  storedb: JSData.DataStore
  constructor ( store: JSData.DataStore, appConfig: AppConfig ) {
    super( store, TestComplexClass , 'complex', {
      title: 'testSimple',
      description: 'Simple Test',
      type: 'object',
      properties: { simpleClassId: { type: 'string' }, name: { type: 'string' } },
      required: [ 'name', 'simpleClassId' ]
    }, {
        belongsTo: {
          simple: {
            localKey: 'simpleClassId',
            localField: 'simpleClass'
          }
        }
      }, [ 'simple' ] )
    this.storedb = store
  }
}
let dao1 = new TestSimpleClassDAO( store, config )
let instance0 = new TestSimpleClass( { name: null } )
let instance1 = new TestSimpleClass( { name: 'test' } )
let instance2 = instance1
instance2.name = 'joao'
describe( 'Simple DAO', () => {

  it( 'Ocorre limpeza de todos os itens que estão no banco?', ( done: Function ) => {
    dao1.collection.destroyAll( {} )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'insert inválido', ( done: Function ) => {
    dao1.create( instance0, null )
      .should.be.rejected
      .and.notify( done )
  } )

  it( 'insert', ( done: Function ) => {
    dao1.create( instance1, null )
      .then( result => {
        return ( result.should.have.property( 'id' ).eq( instance1.id )
          && result.should.have.property( 'name' ).eq( instance1.name )
          && result.should.have.property( 'createdAt' ).eq( instance1.createdAt )
          && result.should.have.property( 'updatedAt' ).eq( null ) )
      } )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'update inválido', ( done: Function ) => {
    dao1.update( instance1.id, null, instance0 )
      .should.be.rejected
      .and.notify( done )
  } )

  it( 'update', ( done: Function ) => {
    dao1.update( instance1.id, null, instance2 )
      .then( result => {
        return ( result.should.have.property( 'id' ).eq( instance2.id )
          && result.should.have.property( 'name' ).eq( instance2.name )
          && result.should.have.property( 'createdAt' ).eq( instance2.createdAt )
          && result.should.have.property( 'updatedAt' ).not.eq( null ) )
      } )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'find', ( done: Function ) => {
    dao1.find( instance2.id, null )
      .then( result => {
        return ( result.should.have.property( 'id' ).eq( instance2.id )
          && result.should.have.property( 'name' ).eq( instance2.name )
          && result.should.have.property( 'createdAt' ).eq( instance2.createdAt )
          && result.should.have.property( 'updatedAt' ).eq( instance2.updatedAt ) )
      } )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'listAll', ( done: Function ) => {
    dao1.findAll( {}, null )
      .should.eventually.have.a.instanceof( Array )
      .should.eventually.have.property( 'length' ).eq( 1 )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'query', ( done: Function ) => {
    dao1.paginatedQuery( {}, null, 1, 10 )
      .should.be.fulfilled
      .and.notify( done )
  } )
} )

let dao2 = new TestComplexClassDAO( store, config )
let instance3 = new TestComplexClass( { name: 'test', simpleClassId: instance1.id } )

describe( 'Complex DAO', () => {

  it( 'Ocorre limpeza de todos os itens que estão no banco?', ( done: Function ) => {
    dao2.collection.destroyAll( {} )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'insert', ( done: Function ) => {
    dao2.create( instance3, null )
      .then( result => {
        return ( result.should.have.property( 'id' ).eq( instance3.id )
          && result.should.have.property( 'name' ).eq( instance3.name )
          && result.should.have.property( 'createdAt' ).eq( instance3.createdAt )
          && result.should.have.property( 'updatedAt' ).eq( instance3.updatedAt )
          && result.should.have.property( 'simpleClassId' ).eq( instance1.id ) )
      } )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'find', ( done: Function ) => {
    dao2.find( instance3.id, null )
      .then(( result: ITestComplexClass ) => {
        return (
          result.should.have.property( 'id' ).eq( instance3.id )
          && result.should.have.property( 'name' ).eq( instance3.name )
          && result.should.have.property( 'createdAt' ).eq( instance3.createdAt )
          && result.should.have.property( 'updatedAt' ).eq( instance3.updatedAt )
          && result.simpleClass.should.have.property( 'id' ).eq( instance1.id )
          && result.simpleClass.should.have.property( 'id' ).eq( instance1.id )
          && result.simpleClass.should.have.property( 'name' ).eq( instance1.name )
          && result.simpleClass.should.have.property( 'createdAt' ).eq( instance1.createdAt ) )
      } )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'listAll', ( done: Function ) => {
    dao2.findAll( {}, null )
      .should.eventually.have.a.instanceof( Array )
      .should.eventually.have.property( 'length' ).eq( 1 )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'query', ( done: Function ) => {
    dao1.paginatedQuery( {}, null )
      .then(( result: IResultSearch<ITestComplexClass> ) => {
        return (
          result.should.have.property( 'page' ).eq( 1 )
          && result.should.have.property( 'total' )
          && result.should.have.property( 'result' ) )
      } )
      .should.be.fulfilled
      .and.notify( done )
  } )

} )

let instance4 = new TestComplexClass( { name: 'invalid', simpleClassId: instance1.id } )

describe( 'Incomplete DAO', () => {
  delete instance4.name
  it( 'add invalida complex', ( done: Function ) => {
    dao2.create( instance4, null )
      .should.be.rejected
      .and.notify( done )
  } )
} )

describe( 'Clean DAO ops', () => {
  it( 'delete complex', ( done: Function ) => {
    dao2.delete( instance3.id, null )
      .should.be.fulfilled
      .should.be.eventually.equal( true )
      .and.notify( done )
  } )

  // TODO pendente teste de delete invalido por problemas da resposta do js-data
  // it( 'delete invalid', ( done: Function ) => {
  //   dao1.delete( instance1.id + 'blabla', null )
  //     .should.be.rejected
  //     .and.notify( done )
  // } )

  it( 'delete simple', ( done: Function ) => {
    dao1.delete( instance1.id, null )
      .should.be.fulfilled
      .should.be.eventually.equal( true )
      .and.notify( done )
  } )
} )

describe( 'Instance new same DAO', () => {
  let dao3 = new TestSimpleClassDAO( store, config )
  it( 'listAll', ( done: Function ) => {
    dao3.findAll( {}, null )
      .should.be.fulfilled
      .and.notify( done )
  } )

} )

class TestOtherSimpleClassDAO extends DAO<ITestSimpleClass> {
  storedb: JSData.DataStore
  constructor ( store: JSData.DataStore, appConfig: AppConfig ) {
    super( store, TestSimpleClass , 'other' )
    this.storedb = store
  }

}

describe( 'install minimal config', () => {
  let dao4 = new TestOtherSimpleClassDAO( store, config )
  let instance5 = new TestSimpleClass( { name: 'invalid' } )

  it( 'Ocorre limpeza de todos os itens que estão no banco?', ( done: Function ) => {
    dao4.collection.destroyAll( {} )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'insert', ( done: Function ) => {
    dao4.create( instance5, null )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'listAll', ( done: Function ) => {
    dao4.findAll( {}, null )
      .should.be.fulfilled
      .and.notify( done )
  } )

} )

// let instanceInvalid = new TestInvalidClass( { name: 'test invalid' } )
let daoInvalid = new TestInvalidClassDAO( store, config )

describe( 'Invalid DAO', () => {

  it( 'insert', ( done: Function ) => {
    // let a = GenericDeserialize({ name: 'test invalid' }, TestInvalidClass)
    daoInvalid.create( { name: 'test invalid' }, null )
      .should.be.rejected
      .and.notify( done )
  } )

  it( 'find all em tabela vazia', ( done: Function ) => {
    daoInvalid.findAll( {}, null )
      .should.eventually.have.a.instanceof( Array )
      .should.eventually.have.property( 'length' ).eq( 0 )
      .and.notify( done )
  } )
} )

describe( 'Construtor Inválido', () => {

  it( 'testando construir uma classe de forma invalida', ( done: Function ) => {
    let fcn = () => new TestInvalidClassDAO( null, config )
    chai.expect( fcn ).to.throw()
    done()
  } )

} )
