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

  it('A classe é instanciável?', (done: Function) => {
    assert(bm instanceof ServiceLib)
    done()
  })

  it('Testando  GenerateToken ?', (done: Function) => {
    bm.generateToken('test@test.com').should.be.a('string')
    done()
  })

  it('Testando  Encrypt ?', (done: Function) => {
    bm.encrypt('test@test.com').should.be.a('string')
    done()
  })

  it('Testando  Decrypt ?', (done: Function) => {
    bm.decrypt(bm.encrypt('test@test.com'))
    .should.be.eq('test@test.com')
    done()
  })

  it('Validate email (false) ?', (done: Function) => {
    ServiceLib.emailValidator('tees@')
    .should.be.eq(false)
    done()
  })

  it('Validate email (true) ?', (done: Function) => {
    ServiceLib.emailValidator('tees@teste.com')
    .should.be.eq(true)
    done()
  })
})
