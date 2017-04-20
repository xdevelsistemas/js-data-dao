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
 * classe simples para testes
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
    throw new Error( 'provocando erro na instanciação' )
  }
}

/**
 * classe com dependencia da classe simples TestSimpleClass
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

/**
 * classe de teste de persistencia simples
 *
 * @export
 * @class TestSimpleClassDAO
 * @extends {DAO<ITestSimpleClass>}
 */
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

/**
 * classe para teste de persistencia com dependencia de fk
 *
 * @export
 * @class TestComplexClassDAO
 * @extends {DAO<ITestComplexClass>}
 */
export class TestComplexClassDAO extends DAO<ITestComplexClass> {
  storedb: JSData.DataStore
  constructor ( store: JSData.DataStore, appConfig: AppConfig ) {
    super( store, TestComplexClass, 'complex', {
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

/**
 * classe para teste de criação de teste do DAO
 *
 * @class TestOtherSimpleClassDAO
 * @extends {DAO<ITestSimpleClass>}
 */
class TestOtherSimpleClassDAO extends DAO<ITestSimpleClass> {
  storedb: JSData.DataStore
  constructor ( store: JSData.DataStore, appConfig: AppConfig ) {
    super( store, TestSimpleClass, 'other' )
    this.storedb = store
  }
}

describe( 'Simple DAO', () => {
  let testSimpleDAO = new TestSimpleClassDAO( store, config )
  let testSimpleClass = new TestSimpleClass( { name: null } )
  let testSimpleClassOriginal = new TestSimpleClass( { name: 'test' } )
  let testSimpleClassUpdated = testSimpleClassOriginal
  testSimpleClassUpdated.name = 'joao'

  it( 'Ocorre limpeza de todos os itens que estão no banco?', ( done: Function ) => {
    testSimpleDAO.collection.destroyAll( {} )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'insert inválido', ( done: Function ) => {
    testSimpleDAO.create( testSimpleClass, null )
      .should.be.rejected
      .and.notify( done )
  } )

  it( 'insert', ( done: Function ) => {
    testSimpleDAO.create( testSimpleClassOriginal, null )
      .then( result => {
        return ( result.should.have.property( 'id' ).eq( testSimpleClassOriginal.id )
          && result.should.have.property( 'name' ).eq( testSimpleClassOriginal.name )
          && result.should.have.property( 'createdAt' ).eq( testSimpleClassOriginal.createdAt )
          && result.should.have.property( 'updatedAt' ).eq( null ) )
      } )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'update inválido', ( done: Function ) => {
    testSimpleDAO.update( testSimpleClassOriginal.id, null, testSimpleClass )
      .should.be.rejected
      .and.notify( done )
  } )

  it( 'update', ( done: Function ) => {
    testSimpleDAO.update( testSimpleClassOriginal.id, null, testSimpleClassUpdated )
      .then( result => {
        return ( result.should.have.property( 'id' ).eq( testSimpleClassUpdated.id )
          && result.should.have.property( 'name' ).eq( testSimpleClassUpdated.name )
          && result.should.have.property( 'createdAt' ).eq( testSimpleClassUpdated.createdAt )
          && result.should.have.property( 'updatedAt' ).not.eq( null ) )
      } )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'find', ( done: Function ) => {
    testSimpleDAO.find( testSimpleClassUpdated.id, null )
      .then( result => {
        return ( result.should.have.property( 'id' ).eq( testSimpleClassUpdated.id )
          && result.should.have.property( 'name' ).eq( testSimpleClassUpdated.name )
          && result.should.have.property( 'createdAt' ).eq( testSimpleClassUpdated.createdAt )
          && result.should.have.property( 'updatedAt' ).eq( testSimpleClassUpdated.updatedAt ) )
      } )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'listAll', ( done: Function ) => {
    testSimpleDAO.findAll( {}, null )
      .should.eventually.have.a.instanceof( Array )
      .should.eventually.have.property( 'length' ).eq( 1 )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'query', ( done: Function ) => {
    testSimpleDAO.paginatedQuery( {}, null, 1, 10 )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'delete simple', ( done: Function ) => {
    testSimpleDAO.delete( testSimpleClassOriginal.id, null )
      .should.be.fulfilled
      .should.be.eventually.equal( true )
      .and.notify( done )
  } )
} )

describe( 'Complex DAO', () => {
  let testSimpleDAO = new TestSimpleClassDAO( store, config )
  let testSimpleClass = new TestSimpleClass( { name: 'test' } )
  let testComplexDAO = new TestComplexClassDAO( store, config )
  let testComplexClass = new TestComplexClass( { name: 'test', simpleClassId: testSimpleClass.id } )

  it( 'Ocorre limpeza de todos os itens que estão no banco?', ( done: Function ) => {
    testComplexDAO.collection.destroyAll( {} )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'reinserindo dependencia (instancia de simpleClass)', ( done: Function ) => {
    testSimpleDAO.create( testSimpleClass, null )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'insert', ( done: Function ) => {
    testComplexDAO.create( testComplexClass, null )
      .then( result => {
        return ( result.should.have.property( 'id' ).eq( testComplexClass.id )
          && result.should.have.property( 'name' ).eq( testComplexClass.name )
          && result.should.have.property( 'createdAt' ).eq( testComplexClass.createdAt )
          && result.should.have.property( 'updatedAt' ).eq( testComplexClass.updatedAt )
          && result.should.have.property( 'simpleClassId' ).eq( testSimpleClass.id ) )
      } )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'find', ( done: Function ) => {
    testComplexDAO.find( testComplexClass.id, null )
      .then(( result: ITestComplexClass ) => {
        return (
          result.should.have.property( 'id' ).eq( testComplexClass.id )
          && result.should.have.property( 'name' ).eq( testComplexClass.name )
          && result.should.have.property( 'createdAt' ).eq( testComplexClass.createdAt )
          && result.should.have.property( 'updatedAt' ).eq( testComplexClass.updatedAt )
          && result.simpleClass.should.have.property( 'id' ).eq( testSimpleClass.id )
          && result.simpleClass.should.have.property( 'id' ).eq( testSimpleClass.id )
          && result.simpleClass.should.have.property( 'name' ).eq( testSimpleClass.name )
          && result.simpleClass.should.have.property( 'createdAt' ).eq( testSimpleClass.createdAt ) )
      } )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'find sem join', ( done: Function ) => {
    testComplexDAO.find( testComplexClass.id, null, { joins: [] } )
      .then(( result: ITestComplexClass ) => {
        return (
          result.should.have.property( 'id' ).eq( testComplexClass.id )
          && result.should.have.property( 'name' ).eq( testComplexClass.name )
          && result.should.have.property( 'createdAt' ).eq( testComplexClass.createdAt )
          && result.should.have.property( 'updatedAt' ).eq( testComplexClass.updatedAt )
          && result.should.not.have.property( 'simpleClass' ) )
      } )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'listAll', ( done: Function ) => {
    testComplexDAO.findAll( {}, null )
      .should.eventually.have.a.instanceof( Array )
      .should.eventually.have.property( 'length' ).eq( 1 )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'query', ( done: Function ) => {
    testSimpleDAO.paginatedQuery( {}, null )
      .then(( result: IResultSearch<ITestComplexClass> ) => {
        return (
          result.should.have.property( 'page' ).eq( 1 )
          && result.should.have.property( 'total' )
          && result.should.have.property( 'result' ) )
      } )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'delete complex', ( done: Function ) => {
    testComplexDAO.delete( testComplexClass.id, null )
      .should.be.fulfilled
      .should.be.eventually.equal( true )
      .and.notify( done )
  } )

} )

describe( 'Incomplete DAO', () => {
  let testComplexDAO = new TestComplexClassDAO( store, config )
  let testSimpleClass = new TestSimpleClass( { name: 'test' } )
  let testComplexClassForceIncomplete = new TestComplexClass( { name: 'invalid', simpleClassId: testSimpleClass.id } )
  /**
   * forçando a deleção da propriedade `name`
   */
  delete testComplexClassForceIncomplete.name
  it( 'add invalida complex', ( done: Function ) => {
    testComplexDAO.create( testComplexClassForceIncomplete, null )
      .should.be.rejected
      .and.notify( done )
  } )
} )

describe( 'Instance new same DAO', () => {
  it( 'listAll', ( done: Function ) => {
    ( new TestSimpleClassDAO( store, config ) ).findAll( {}, null )
      .should.be.fulfilled
      .and.notify( done )
  } )

} )

describe( 'install minimal config', () => {
  let testSimpleClassDAOMinimalConfig = new TestOtherSimpleClassDAO( store, config )

  it( 'Ocorre limpeza de todos os itens que estão no banco?', ( done: Function ) => {
    testSimpleClassDAOMinimalConfig.collection.destroyAll( {} )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'insert', ( done: Function ) => {
    testSimpleClassDAOMinimalConfig.create( { name: 'invalid' }, null )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'listAll', ( done: Function ) => {
    testSimpleClassDAOMinimalConfig.findAll( {}, null )
      .should.be.fulfilled
      .and.notify( done )
  } )

} )

describe( 'Invalid DAO', () => {
  let testInvalidClassDAO = new TestInvalidClassDAO( store, config )

  it( 'Ocorre limpeza de todos os itens que estão no banco?', ( done: Function ) => {
    testInvalidClassDAO.collection.destroyAll( {} )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'insert', ( done: Function ) => {
    testInvalidClassDAO.create( { name: 'test invalid' }, null )
      .should.be.rejected
      .and.notify( done )
  } )

  it( 'find all em tabela vazia', ( done: Function ) => {
    testInvalidClassDAO.findAll( {}, null )
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

describe( 'query com operações do "query-syntax"', () => {
  let testSimpleDAO = new TestSimpleClassDAO( store, config )
  it( 'Limpeza da tabela', ( done: Function ) => {
    testSimpleDAO.collection.destroyAll( {} )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'inserts', ( done: Function ) => {
    testSimpleDAO.create( { name: 'joao' }, null )
      .then(() => testSimpleDAO.create( { name: 'zzz_maria' }, null ) )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'orderBy existem resultados?', ( done: Function ) => {
    testSimpleDAO.paginatedQuery( { orderBy: [ [ 'name', 'DESC' ] ] }, null )
      .should.eventually.have.property( 'result' ).have.property( 'length' ).eq( 2 )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'paginatedQuery orderBy by name (asc)', ( done: Function ) => {
    testSimpleDAO.paginatedQuery( { orderBy: [ [ 'name', 'ASC' ] ] }, null )
      .then(( r ) => {
        return r
      } )
      .should.eventually.have.deep.property( 'result[0].name', 'joao' )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'paginatedQuery orderBy by name (desc)', ( done: Function ) => {
    testSimpleDAO.paginatedQuery( { orderBy: [ [ 'name', 'DESC' ] ] }, null )
      .then(( r ) => {
        return r
      } )
      .should.eventually.have.deep.property( 'result[0].name', 'zzz_maria' )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'findAll orderBy by name (asc)', ( done: Function ) => {
    testSimpleDAO.findAll( { orderBy: [ [ 'name', 'ASC' ] ] }, null )
      .then(( r ) => {
        return r
      } )
      .should.eventually.have.deep.property( '[0].name', 'joao' )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'findAll orderBy by name (desc)', ( done: Function ) => {
    testSimpleDAO.findAll( { orderBy: [ [ 'name', 'DESC' ] ] }, null )
      .then(( r ) => {
        return r
      } )
      .should.eventually.have.deep.property( '[0].name', 'zzz_maria' )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'findAll orderBy by createdAt (asc)', ( done: Function ) => {
    testSimpleDAO.findAll( { orderBy: [ [ 'createdAt', 'ASC' ] ] }, null )
      .then(( r ) => {
        return r
      } )
      .should.eventually.have.deep.property( '[0].name', 'joao' )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'findAll orderBy by createdAt (desc)', ( done: Function ) => {
    testSimpleDAO.findAll( { orderBy: [ [ 'createdAt', 'DESC' ] ] }, null, { joins: [] } )
      .then(( r ) => {
        return r
      } )
      .should.eventually.have.deep.property( '[0].name', 'zzz_maria' )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'limpando após os testes', ( done: Function ) => {
    testSimpleDAO.collection.destroyAll( {} )
      .should.be.fulfilled
      .and.notify( done )
  } )
} )
