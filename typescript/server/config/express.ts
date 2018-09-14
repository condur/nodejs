import * as expressjs from 'express'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as path from 'path'
import * as session from 'express-session'
import { PassportStatic } from 'passport' // eslint-disable-line no-unused-vars
import { logger } from '../middlewares/logger'
import * as db from '../database'

export let express = (app: expressjs.Express, passport: PassportStatic) => {
  // ---------------------------------------------------------------------------------------------
  // Parse incoming request bodies in a middleware before your handlers,
  // available under the req.body property.
  // ---------------------------------------------------------------------------------------------
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))

  // ---------------------------------------------------------------------------------------------
  // Set up ejs for templating and the views location path
  // ---------------------------------------------------------------------------------------------
  app.set('view engine', 'ejs')
  app.set('views', path.join(__dirname, 'client', 'views'))

  // ---------------------------------------------------------------------------------------------
  // Parse HTTP request cookies
  // ---------------------------------------------------------------------------------------------
  app.use(cookieParser())

  // ---------------------------------------------------------------------------------------------
  // A simple, minimal PostgreSQL session store for Express/Connect
  // ---------------------------------------------------------------------------------------------
  const PGSession = require('connect-pg-simple')(session)

  // ---------------------------------------------------------------------------------------------
  // Simple session middleware for Express
  // ---------------------------------------------------------------------------------------------
  app.use(session({
    store: new PGSession({ pgPromise: db }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      secure: 'auto',
      maxAge: 3600000 // 1 hour
    }
  }))

  // ---------------------------------------------------------------------------------------------
  // Simple, unobtrusive authentication for Node.js
  // ---------------------------------------------------------------------------------------------
  app.use(passport.initialize())
  app.use(passport.session())

  // ---------------------------------------------------------------------------------------------
  //  Flash message middleware for Express.
  // ---------------------------------------------------------------------------------------------
  app.use(require('connect-flash')())

  // ---------------------------------------------------------------------------------------------
  // Condigure static files access.
  // ---------------------------------------------------------------------------------------------
  app.use(expressjs.static(path.join(__dirname, 'client', 'public')))

  // ---------------------------------------------------------------------------------------------
  // Configure the app server to log all the requests.
  // Note: The logger is not recording static files access.
  // ---------------------------------------------------------------------------------------------
  app.use(logger)
}
