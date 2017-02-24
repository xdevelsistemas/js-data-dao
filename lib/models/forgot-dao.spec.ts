import { AppConfig } from '../config'
import { ForgotDAO } from './forgot-dao'
import * as assert from 'assert'
import * as chai from 'chai'
import * as JSData from 'js-data'
chai.should()
/**
 * preparando testabililidade do ambiente
 */
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
const dao = new ForgotDAO(store,config)

describe('ServiceLib', () => {

  it('A classe é instanciável?', () => {
    assert(dao instanceof ForgotDAO)
  })
})
