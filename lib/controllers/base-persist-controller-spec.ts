import { BasePersistController } from './'
import { TestSimpleClassDAO, ITestSimpleClass } from '../models/dao-spec'
import { AppConfig } from '../config'
import * as JSData from 'js-data'
import * as chai from 'chai'
import * as assert from 'assert'
import * as chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
chai.should()

export class TestController extends BasePersistController<ITestSimpleClass> {
}

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
let dao = new TestSimpleClassDAO(store, config)

let ctrl = new TestController(dao)

describe('Persist Controller Basic', () => {
  it('Controller é Instanciável ?', () => {
    assert(ctrl instanceof TestController)
  })
})
