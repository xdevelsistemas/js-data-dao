import { BaseModel } from './base-model'
import * as assert from 'assert'
import * as chai from 'chai'
chai.should()
let expect = chai.expect
/**
 * preparando testabililidade do ambiente
 */
describe('BaseModel', () => {
  const bm = new BaseModel()
  const bm2 = new BaseModel({ id: '1', active: true })
  const bm3 = new BaseModel({ id: null, active: true })
  const bm4 = new BaseModel({ id: null, active: null })
  const bm5 = new BaseModel({ id: null })

  it('A classe é instanciável?', () => {
    assert(bm instanceof BaseModel)
  })

  it('A classe gerou todos os itens com uma instancia vazia ?', () => {
    return expect(bm).have.property('id').is.not.null &&
      expect(bm).have.property('active').eq(true) &&
      expect(bm).have.property('createdAt').is.not.null &&
      expect(bm).have.property('updatedAt').is.null
  })

  it('A classe gerou todos os itens com uma instancia parcialmente preenchida ?', () => {
    return expect(bm2).have.property('id').eq('1') &&
      expect(bm2).have.property('active').eq(true) &&
      expect(bm2).have.property('createdAt').is.not.null &&
      expect(bm2).have.property('updatedAt').is.not.null
  })

  it('A classe gerou todos os itens com uma instancia parcialmente preenchida faltando id ?', () => {
    return expect(bm3).have.property('id').is.not.null &&
      expect(bm3).have.property('active').eq(true) &&
      expect(bm3).have.property('createdAt').is.not.null &&
      expect(bm3).have.property('updatedAt').is.not.null
  })

  it('A classe gerou todos os itens com uma instancia parcialmente preenchida faltando active ?', () => {
    return expect(bm4).have.property('id').is.not.null &&
      expect(bm4).have.property('active').eq(true) &&
      expect(bm4).have.property('createdAt').is.not.null &&
      expect(bm4).have.property('updatedAt').is.not.null &&
      expect(bm5).have.property('id').is.not.null &&
      expect(bm5).have.property('active').eq(true) &&
      expect(bm5).have.property('createdAt').is.not.null &&
      expect(bm5).have.property('updatedAt').is.not.null
  })
})
