import { Response, Router } from 'express'
import { APIError } from '../services/api-error'
import { IBaseModel } from '../interfaces'
import { IPersistController } from '../interfaces'
import * as JSData from 'js-data'

export class BaseRouter {
  respond(t: Promise<any>, res: Response): Promise<Response> {
    return t
      .then((u) => res.json(u))
      .catch((err: APIError) => res.status(err.statusCode).json(err.error))
  }
}

export class PersistRouter<M extends IBaseModel, C extends IPersistController<M>> extends BaseRouter {
  controller: C
  router: Router

  constructor(store: JSData.DataStore, controller: C) {
    super()
    this.controller = controller
    this.router = Router()
    this.routers()
  }

  public routers() {
    let ctrl = this.controller
    /* GET lista todos os registros da classe corrente em controller. */
    this.router.get('/', (req, res, next) => this.respond(ctrl.findAll(req, res, next), res))

    /* GET busca o registro com o id. */
    this.router.get('/:id', (req, res, next) => this.respond(ctrl.find(req, res, next), res))

    /* POST cria um novo registro da classe corrente em controller. */
    this.router.post('/', (req, res, next) => this.respond(ctrl.create(req, res, next), res))

    /* PUT atualiza o registro. */
    this.router.put('/:id', (req, res, next) => this.respond(ctrl.update(req, res, next), res))

    /* DELETE deleta o registro com o id. */
    this.router.delete('/:id', (req, res, next) => this.respond(ctrl.delete(req, res, next), res))

    /* POST lista paginada com os registros da classe corrente em controller. */
    this.router.post('/query', (req, res, next) => this.respond(ctrl.query(req, res, next), res))
  }

  public getRouter(): Router {
    return this.router
  }
}
