import { Request, Response, Router, NextFunction } from 'express'

export class PingRouter {

  private _router: Router

  constructor () {
    this._router = Router()
    this.routers()
  }

  public routers () {
    this._router.get('/', (req: Request, res: Response, next: NextFunction) => res.json('pong'))
  }

  public get router (): Router {
    return this._router
  }
}
