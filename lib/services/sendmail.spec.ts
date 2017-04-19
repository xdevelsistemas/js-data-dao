import { MailConfig } from '../config/mail-config'
import { SendMail } from './sendmail'
import * as assert from 'assert'
import * as chai from 'chai'
import * as path from 'path'
const nodemailerMock = require( 'nodemailer-mock-transport' )
import * as chaiAsPromised from 'chai-as-promised'
chai.use( chaiAsPromised )
chai.should()

describe( 'SendMail', () => {
  /**
   * preparando testabililidade do ambiente
   */
  process.env.LAYOUT_PATH = path.join( __dirname, '../../testResources' )
  process.env.CRYPTO_PASSWORD = 'secret'
  const sm0 = new SendMail( new MailConfig() )
  const sm = new SendMail( new MailConfig(), nodemailerMock( { foo: 'bar' } ) )

  it( 'A classe é instanciável? (nodemailer padrao)', ( done: Function ) => {
    assert( sm0 instanceof SendMail )
    done()
  } )

  it( 'A classe é instanciável? (nodemailer mockup)', ( done: Function ) => {
    assert( sm instanceof SendMail )
    done()
  } )

  it( 'Teste de simulaçao de envio de confirmacao', ( done: Function ) => {
    sm.sendConfirmationEmail( 'test@test.com', 'http://teste.com.br' )
      .should.be.fulfilled
      .and.notify( done )
  } )

  it( 'Teste de simulaçao de envio de forgot', ( done: Function ) => {
    sm.sendForgotEmail( 'jhon doe', 'test@test.com', 'http://teste.com.br' )
      .should.be.fulfilled
      .and.notify( done )
  } )

} )

describe( 'SendMail com erro de config', () => {
  process.env.LAYOUT_PATH = path.join( __dirname, '../../testResources_ajsjhasahj' )
  process.env.CRYPTO_PASSWORD = 'secret'
  const sm2 = new SendMail( new MailConfig(), nodemailerMock( { foo: 'bar' } ) )

  it( 'A classe é instanciável? (nodemailer mockup)', ( done: Function ) => {
    assert( sm2 instanceof SendMail )
    done()
  } )

  it( 'Teste de simulaçao de envio de confirmacao', ( done: Function ) => {
    sm2.sendConfirmationEmail( 'test@test.com', 'http://teste.com.br' )
      .should.be.rejected
      .and.notify( done )
  } )

  it( 'Teste de simulaçao de envio de forgot', ( done: Function ) => {
    sm2.sendForgotEmail( 'jhon doe', 'test@test.com', 'http://teste.com.br' )
      .should.be.rejected
      .and.notify( done )
  } )

} )
