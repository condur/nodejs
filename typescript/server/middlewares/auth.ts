import { RequestHandler, Request, Response, NextFunction } from 'express' // eslint-disable-line no-unused-vars

export let requiresLogin: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/typescript/login')
}
