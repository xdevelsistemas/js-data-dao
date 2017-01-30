import { DAO } from './dao'
import { IBaseModel } from '../interfaces'
import { BaseModel } from './base-model'
import { AppConfig } from '../config'
import * as JSData from 'js-data'
import * as assert from 'assert'
import * as chai from 'chai'
import * as _ from 'lodash'
import * as chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
chai.should()
let expect = chai.expect
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
    config.dbConfig.getAdapterOptions()
  )
  return store
}

let store: JSData.DataStore = handleJSData(config)
/**
 * interface needed for unit test
 * the interface constains only property name
 *
 * @interface ITestSimpeClass
 * @extends {IBaseModel}
 */
interface ITestSimpeClass extends IBaseModel {
  name: string
}

interface ITestComplexClass extends IBaseModel {
  name: string
  simpleClassId: string
  simpleClass: ITestSimpeClass
}

/**
 * class for unit test
 *
 * @class TestSimpleClass
 * @extends {BaseModel}
 * @implements {ITestSimpeClass}
 */
class TestSimpleClass extends BaseModel implements ITestSimpeClass {
  name: string

  constructor(obj: ITestSimpeClass) {
    super(obj)
    this.name = obj.name
  }
}


/**
 *
 *
 * @class TestComplexClass
 * @extends {BaseModel}
 * @implements {ITestComplexClass}
 */
class TestComplexClass extends BaseModel implements ITestComplexClass {
  name: string
  simpleClassId: string
  simpleClass: ITestSimpeClass

  constructor(obj: ITestComplexClass) {
    super(obj)
    this.name = obj.name
    this.simpleClassId = obj.simpleClassId
  }
}

class TestSimpleClassDAO extends DAO<ITestSimpeClass> {
  storedb: JSData.DataStore
  constructor(store: JSData.DataStore, appConfig: AppConfig) {
    const testSimple = store.defineMapper('test_simple')
    super(testSimple, [])
    this.storedb = store
  }

  public create(obj: ITestSimpeClass, userP: any): Promise<ITestSimpeClass> {
    let testSimpleClass: ITestSimpeClass = new TestSimpleClass(obj)
    return this.collection.create(testSimpleClass)
  }

}

class TestComplexClassDAO extends DAO<ITestComplexClass> {
  storedb: JSData.DataStore
  constructor(store: JSData.DataStore, appConfig: AppConfig) {
    const testSimple = store.defineMapper('test_complex', {
    })
    super(testSimple, [])
    this.storedb = store
  }

  public create(obj: ITestSimpeClass, userP: any): Promise<ITestSimpeClass> {
    let testSimpleClass: ITestSimpeClass = new TestSimpleClass(obj)
    return this.collection.create(testSimpleClass)
  }

}

describe('Simple DAO', () => {
  let dao1 = new TestSimpleClassDAO(store, config)
  let instance1 = new TestSimpleClass({ name : 'test'})

  it('Ocorre limpeza de todos os itens que estão no banco?', () => {
    dao1.collection.destroyAll({}).should.eventually.fulfilled
  })

  it('insert', () => {
    dao1.create(instance1, null).should.eventually.fulfilled
  })

  it('update', () => {
    let i2 = instance1
    i2.name = 'joao'
    dao1.update(i2.id,null,i2).should.eventually.fulfilled
    .have.property('id').eq(i2.id)
    .have.property('name').eq(i2.name)
    .have.property('createdAt').eq(i2.createdAt)
    .have.property('updatedAt').eq(i2.updatedAt)
  })

  it('find', () => {
    dao1.find(instance1.id,null).should.eventually.fulfilled
    .should.eventually.instanceof(Object)
  })

  it('listAll', () => {
    dao1.findAll({},null).should.eventually.fulfilled
    .should.eventually.instanceof(Array)
    .have.property('length').eq(1)
  })

  let dao2 = new TestSimpleClassDAO(store, config)
  let instance1 = new TestSimpleClass({ name : 'test'})


  it('inserindo o DAO2 que é mais complexo', () => {
    dao1.findAll({},null).should.eventually.fulfilled
    .should.eventually.instanceof(Array)
    .have.property('length').eq(1)
  })

  it('delete', () => {
    dao1.delete(instance1.id,null).should.eventually.fulfilled
  })

})



