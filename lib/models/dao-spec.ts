import { DAO } from './dao'
import { IBaseModel, IResultSearch } from '../interfaces'
import { BaseModel } from './base-model'
import { AppConfig } from '../config'
import * as JSData from 'js-data'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
chai.should()
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

let store: JSData.DataStore = handleJSData(config)
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

  constructor(obj: ITestSimpleClass) {
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
export class TestComplexClass extends BaseModel implements ITestComplexClass {
  name: string
  simpleClassId: string
  simpleClass?: ITestSimpleClass

  constructor(obj: ITestComplexClass) {
    super(obj)
    this.name = obj.name
    this.simpleClassId = obj.simpleClassId
  }
}

export class TestSimpleClassDAO extends DAO<ITestSimpleClass> {
  storedb: JSData.DataStore
  constructor(store: JSData.DataStore, appConfig: AppConfig) {
    super(store, 'simple', {
      title: 'testSimple',
      description: 'Simple Test',
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name']
    }, null, [])
    this.storedb = store
  }

  parseModel(obj: any) {
    return new TestSimpleClass(obj)
  }

}

export class TestComplexClassDAO extends DAO<ITestComplexClass> {
  storedb: JSData.DataStore
  constructor(store: JSData.DataStore, appConfig: AppConfig) {
    super(store, 'complex', {
      title: 'testSimple',
      description: 'Simple Test',
      type: 'object',
      properties: { simpleClassId: { type: 'string' }, name: { type: 'string' } },
      required: ['name', 'simpleClassId']
    }, {
      belongsTo: {
        simple: {
          localKey: 'simpleClassId',
          localField: 'simpleClass'
        }
      }
    }, ['simple'])
    this.storedb = store
  }

  parseModel(obj: any) {
    return new TestComplexClass(obj)
  }
}
let dao1 = new TestSimpleClassDAO(store, config)
let instance1 = new TestSimpleClass({ name: 'test' })
let instance2 = instance1
instance2.name = 'joao'

describe('Simple DAO', () => {

  it('Ocorre limpeza de todos os itens que estão no banco?', (done: Function) => {
    dao1.collection.destroyAll({})
      .should.be.fulfilled
      .and.notify(done)
  })

  it('insert', (done: Function) => {
    dao1.create(instance1, null)
      .then(result => {
        return (result.should.have.property('id').eq(instance1.id)
          && result.should.have.property('name').eq(instance1.name)
          && result.should.have.property('createdAt').eq(instance1.createdAt)
          && result.should.have.property('updatedAt').eq(instance1.updatedAt))
      })
      .should.be.fulfilled
      .and.notify(done)
  })

  it('update', (done: Function) => {
    dao1.update(instance1.id, null, instance2)
      .then(result => {
        return (result.should.have.property('id').eq(instance2.id)
          && result.should.have.property('name').eq(instance2.name)
          && result.should.have.property('createdAt').eq(instance2.createdAt)
          && result.should.have.property('updatedAt').eq(instance2.updatedAt))
      })
      .should.be.fulfilled
      .and.notify(done)
  })

  it('find', (done: Function) => {
    dao1.find(instance2.id, null)
      .then(result => {
        return (result.should.have.property('id').eq(instance2.id)
          && result.should.have.property('name').eq(instance2.name)
          && result.should.have.property('createdAt').eq(instance2.createdAt)
          && result.should.have.property('updatedAt').eq(instance2.updatedAt))
      })
      .should.be.fulfilled
      .and.notify(done)
  })

  it('listAll', (done: Function) => {
    dao1.findAll({}, null)
      .should.eventually.have.a.instanceof(Array)
      .should.eventually.have.property('length').eq(1)
      .should.be.fulfilled
      .and.notify(done)
  })

  it('query', (done: Function) => {
    dao1.paginatedQuery({}, null, 1, 10)
      .should.be.fulfilled
      .and.notify(done)
  })
})

let dao2 = new TestComplexClassDAO(store, config)
let instance3 = new TestComplexClass({ name: 'test', simpleClassId: instance1.id })

describe('Complex DAO', () => {

  it('Ocorre limpeza de todos os itens que estão no banco?', (done: Function) => {
    dao2.collection.destroyAll({})
      .should.be.fulfilled
      .and.notify(done)
  })

  it('insert', (done: Function) => {
    dao2.create(instance3, null)
      .then(result => {
        return (result.should.have.property('id').eq(instance3.id)
          && result.should.have.property('name').eq(instance3.name)
          && result.should.have.property('createdAt').eq(instance3.createdAt)
          && result.should.have.property('updatedAt').eq(instance3.updatedAt)
          && result.should.have.property('simpleClassId').eq(instance1.id))
      })
      .should.be.fulfilled
      .and.notify(done)
  })

  it('find', (done: Function) => {
    dao2.find(instance3.id, null)
      .then((result: ITestComplexClass) => {
        return (
          result.should.have.property('id').eq(instance3.id)
          && result.should.have.property('name').eq(instance3.name)
          && result.should.have.property('createdAt').eq(instance3.createdAt)
          && result.should.have.property('updatedAt').eq(instance3.updatedAt)
          && result.simpleClass.should.have.property('id').eq(instance1.id)
          && result.simpleClass.should.have.property('id').eq(instance1.id)
          && result.simpleClass.should.have.property('name').eq(instance1.name)
          && result.simpleClass.should.have.property('createdAt').eq(instance1.createdAt))
      })
      .should.be.fulfilled
      .and.notify(done)
  })

  it('listAll', (done: Function) => {
    dao2.findAll({}, null)
      .should.eventually.have.a.instanceof(Array)
      .should.eventually.have.property('length').eq(1)
      .should.be.fulfilled
      .and.notify(done)
  })

  it('query', (done: Function) => {
    dao1.paginatedQuery({}, null)
      .then((result: IResultSearch<ITestComplexClass>) => {
        return (
          result.should.have.property('page').eq(1)
        && result.should.have.property('total')
        && result.should.have.property('result'))
      })
      .should.be.fulfilled
      .and.notify(done)
  })

})

let instance4 = new TestComplexClass({ name: 'invalid', simpleClassId: instance1.id })

describe('Incomplete DAO', () => {
  delete instance4.name
  it('add invalida complex', (done: Function) => {
    dao2.create(instance4,null)
      .should.be.rejected
      .and.notify(done)
  })
})

describe('Clean DAO ops', () => {
  it('delete complex', (done: Function) => {
    dao2.delete(instance3.id, null)
      .should.be.fulfilled
      .should.be.eventually.equal(true)
      .and.notify(done)
  })

  it('delete simple', (done: Function) => {
    dao1.delete(instance1.id, null)
      .should.be.fulfilled
      .should.be.eventually.equal(true)
      .and.notify(done)
  })
})

describe('Instance new same DAO', () => {
  let dao3 = new TestSimpleClassDAO(store,config)
  it('listAll', (done: Function) => {
    dao3.findAll({}, null)
      .should.be.fulfilled
      .and.notify(done)
  })

})

class TestOtherSimpleClassDAO extends DAO<ITestSimpleClass> {
  storedb: JSData.DataStore
  constructor(store: JSData.DataStore, appConfig: AppConfig) {
    super(store, 'other')
    this.storedb = store
  }

  parseModel(obj: any) {
    return new TestSimpleClass(obj)
  }

}

describe('install minimal config', () => {
  let dao4 = new TestOtherSimpleClassDAO(store,config)
  let instance5 = new TestSimpleClass({ name: 'invalid'})

  it('Ocorre limpeza de todos os itens que estão no banco?', (done: Function) => {
    dao4.collection.destroyAll({})
      .should.be.fulfilled
      .and.notify(done)
  })

  it('insert', (done: Function) => {
    dao4.create(instance5, null)
      .should.be.fulfilled
      .and.notify(done)
  })

  it('listAll', (done: Function) => {
    dao4.findAll({}, null)
      .should.be.fulfilled
      .and.notify(done)
  })

})
