import { Response, Router, NextFunction } from 'express'
import { IBaseModel } from '../interfaces'
import { IPersistController } from '../interfaces'
import * as JSData from 'js-data'

export class BaseRouter {
  respond ( t: Promise<any>, res: Response, next: NextFunction ): Promise<Response> {
    return t
      .then(( u ) => res.json( u ) )
      .catch(( error ) => next( error ) )
    // .catch(( err: APIError ) => res.status(err.statusCode >= 100 && err.statusCode < 600 ? err.statusCode : 500).json( err.output ) )
  }
}

export class PersistRouter<M extends IBaseModel, C extends IPersistController<M>> extends BaseRouter {
  controller: C
  router: Router

  constructor ( store: JSData.DataStore, controller: C ) {
    super()
    this.controller = controller
    this.router = Router()
    this.routers()
  }

  public routers () {
    let ctrl = this.controller
    /* GET lista todos os registros da classe corrente em controller. */
    this.router.get( '/', ( req, res, next ) => this.respond( ctrl.findAll( req, res, next ), res, next ) )

    /* GET busca o registro com o id. */
    this.router.get( '/:id', ( req, res, next ) => this.respond( ctrl.find( req, res, next ), res, next ) )

    /* POST cria um novo registro da classe corrente em controller. */
    this.router.post( '/', ( req, res, next ) => this.respond( ctrl.create( req, res, next ), res, next ) )

    /* PUT atualiza o registro. */
    this.router.put( '/:id', ( req, res, next ) => this.respond( ctrl.update( req, res, next ), res, next ) )

    /* DELETE deleta o registro com o id. */
    this.router.delete( '/:id', ( req, res, next ) => this.respond( ctrl.delete( req, res, next ), res, next ) )

    /* POST lista paginada com os registros da classe corrente em controller. */
    this.router.post( '/query', ( req, res, next ) => this.respond( ctrl.query( req, res, next ), res, next ) )
  }

  public getRouter (): Router {
    return this.router
  }
}
