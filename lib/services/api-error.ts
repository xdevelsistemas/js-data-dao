// import * as Boom from 'boom'
import { IError } from '../interfaces'

export class APIError extends Error implements IError {

  statusCode: number
  objectResponse: Object
  // private error: Boom.BoomError

  constructor (message: string, statusCode: number, objectResponse?: Object, originalStack?: string) {
    super(message)
    this.statusCode = statusCode
    this.objectResponse = objectResponse
    if (originalStack) {
      this.stack = originalStack
    }
    // this.definedBoomError()
    this.showError()
  }
   // TODO migrar chamadas manuais de APIErr para APIErr.fromError
  // static fromError (error: Error, statusCode: number = 500): APIError {
  //   return new APIError(error.message || 'Ops! Algo deu errado!', statusCode)
  // }

  /**
   * @override
   */
  toString (): string {
    return this.message
  }

  get output (): IError {
    return {
      statusCode: this.statusCode,
      objectResponse: this.objectResponse || { },
      message: this.message
    }
  }

  // private definedBoomError () {
  //   switch (this.statusCode) {
  //     case 400:
  //       this.error = Boom.badRequest(this.message).output.payload.error
  //       break
  //     case 401:
  //       this.error = Boom.unauthorized(this.message).output.payload
  //       break
  //     default:
  //       this.error = Boom.create(this.statusCode, this.message).output.payload
  //       break
  //   }
  // }

  private showError () {
    let err = this
    console.error(`API ERROR CODE: ${err.statusCode}`)
    console.error(`API ERROR MESSAGE: ${err.message}`)
    console.error(`API ERROR STACK: ${err.stack}`)
  }

}
