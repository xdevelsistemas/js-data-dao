import { Request, Response, Router, NextFunction } from 'express'

export class PingRouter {

  router: Router

  constructor() {
    this.router = Router()
    this.routers()
  }

  public routers() {
    this.router.get('/', (req: Request, res: Response, next: NextFunction) => res.json('pong'))
  }

  public getRouter(): Router {
    return this.router
  }
}
