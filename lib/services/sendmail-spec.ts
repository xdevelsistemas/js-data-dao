import { MailConfig } from '../config/mail-config'
import { SendMail } from './sendmail'
import * as assert from 'assert'
import * as chai from 'chai'
chai.should()
/**
 * preparando testabililidade do ambiente
 */
process.env.CRYPTO_PASSWORD = 'secret'
const bm = new SendMail(new MailConfig())

describe('ServiceLib', () => {

  it('A classe é instanciável?', () => {
    assert(bm instanceof SendMail)
  })

})
