import { Express, Request, Response } from 'express' // eslint-disable-line no-unused-vars
import { PassportStatic } from 'passport' // eslint-disable-line no-unused-vars
import { Strategy as LocalStrategy } from 'passport-local' // eslint-disable-line no-unused-vars
import { requiresLogin } from '../middlewares/auth'
import * as version from '../helpers/version'

export let routes = (app: Express, passport: PassportStatic) => {
  app.get('/', requiresLogin, (req: Request, res: Response) => {
    res.render('index')
  })

  app.get('/register', (req: Request, res: Response) => {
    res.render('register', { message: req.flash('message') })
  })

  app.post('/register', passport.authenticate('local-register', {
    successRedirect: '/typescript',
    failureRedirect: '/typescript/register',
    failureFlash: true
  }))

  app.get('/login', (req: Request, res: Response) => {
    res.render('login', { message: req.flash('message') })
  })

  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/typescript',
    failureRedirect: '/typescript/login',
    failureFlash: true
  }))

  app.get('/logout', (req: Request, res: Response) => {
    req.logout()
    res.redirect('/typescript')
  })

  app.get('/version', (req: Request, res: Response) => {
    res.send(version.get())
  })
}
