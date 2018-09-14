import * as express from 'express'
import * as helmet from 'helmet'
import * as passport from 'passport'
import * as config from './config'

// -----------------------------------------------------------------------------------------------
// Configure the application server to use express
// -----------------------------------------------------------------------------------------------
const app = express()

// -----------------------------------------------------------------------------------------------
// Configure the application
// -----------------------------------------------------------------------------------------------
config.passport(passport)
config.express(app, passport)
config.routes(app, passport)

// -----------------------------------------------------------------------------------------------
// Configure to use Helmet - helps to secure by setting various HTTP headers.
// -----------------------------------------------------------------------------------------------
app.use(helmet({
  frameguard: {
    action: 'deny'
  }
}))

// -----------------------------------------------------------------------------------------------
// Set the PORT to be used by the HTTPS Server
// -----------------------------------------------------------------------------------------------
app.set('port', process.env.PORT || 3000)

// -----------------------------------------------------------------------------------------------
// Start HTTPS Server
// -----------------------------------------------------------------------------------------------
app.listen(app.get('port'), () => {
  console.log(('NodeJS Typescript server is listening on port %d in %s mode'),
    app.get('port'),
    app.get('env'))
})

module.exports = app
