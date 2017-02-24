import { MailConfig } from '../config/mail-config'
import { SendMail } from './sendmail'
import * as assert from 'assert'
import * as chai from 'chai'
import * as path from 'path'
const nodemailerMock = require('nodemailer-mock-transport')
chai.should()
/**
 * preparando testabililidade do ambiente
 */
process.env.LAYOUT_PATH = path.join(__dirname,'../../testResources')
process.env.CRYPTO_PASSWORD = 'secret'
const sm0 = new SendMail(new MailConfig())
const sm = new SendMail(new MailConfig(), nodemailerMock({foo : 'bar'}))

describe('SendMail', () => {

  it('A classe é instanciável? (nodemailer padrao)', (done: Function) => {
    assert(sm0 instanceof SendMail)
    done()
  })

  it('A classe é instanciável? (nodemailer mockup)', (done: Function) => {
    assert(sm instanceof SendMail)
    done()
  })

  it('Teste de simulaçao de envio de confirmacao', (done: Function) => {
    sm.sendConfirmationEmail('test@test.com', 'http://teste.com.br')
    .then(() => done())
    .catch((err) => done(err))
    .should.be.fulfilled
  })

  it('Teste de simulaçao de envio de forgot', (done: Function) => {
    sm.sendForgotEmail('jhon doe', 'test@test.com', 'http://teste.com.br')
    .then(() => done())
    .catch((err) => done(err))
    .should.be.fulfilled
  })

})
