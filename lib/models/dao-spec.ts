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

describe('DAO', () => {
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
    dao1.update(instance1.id,null,i2).should.eventually.fulfilled
  })

  it('find', () => {
    dao1.find(instance1.id,null).should.eventually.fulfilled
  })

  it('listAll', () => {
    dao1.findAll({},null).should.eventually.fulfilled
  })

  it('delete', () => {
    dao1.delete(instance1.id,null).should.eventually.fulfilled
  })

})
