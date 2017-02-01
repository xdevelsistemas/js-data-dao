import { AppConfig } from '../config'
import { ServiceLib } from './service-lib'
import * as assert from 'assert'
import * as chai from 'chai'
chai.should()
/**
 * preparando testabililidade do ambiente
 */
process.env.CRYPTO_PASSWORD = 'secret'
const bm = new ServiceLib(new AppConfig())

describe('ServiceLib', () => {

  it('A classe é instanciável?', () => {
    assert(bm instanceof ServiceLib)
  })

  it('Testando  GenerateToken ?', () => {
    bm.generateToken('test@test.com').should.be.a('string')
  })

  it('Testando  Encrypt ?', () => {
    bm.encrypt('test@test.com').should.be.a('string')
  })

  it('Testando  Decrypt ?', () => {
    bm.decrypt(bm.encrypt('test@test.com'))
    .should.be.eq('test@test.com')
  })

  it('Validate email (false) ?', () => {
    ServiceLib.emailValidator('tees@')
    .should.be.eq(false)
  })

  it('Validate email (true) ?', () => {
    ServiceLib.emailValidator('tees@teste.com')
    .should.be.eq(true)
  })
})
