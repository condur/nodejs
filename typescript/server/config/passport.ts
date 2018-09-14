import { PassportStatic } from 'passport' // eslint-disable-line no-unused-vars
import { Strategy as LocalStrategy } from 'passport-local'
import * as bcrypt from 'bcrypt'
import * as db from '../database'

// only letters, numbers and underscores
const usernameRegex = /^\w+$/

// Minimum eight characters, at least one letter, one number and one special character:
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/

export let passport = (passport: PassportStatic) => {
  passport.use('local-register', new LocalStrategy({ passReqToCallback: true },
    (req, username, password, done) => {
      if (username === '') {
        return done(null, false, req.flash('message', 'Username cannot be blank!'))
      }
      if (!usernameRegex.test(username)) {
        return done(null, false,
          req.flash('message', 'Username must contain only letters, numbers and underscores!'))
      }
      if (!passwordRegex.test(password)) {
        return done(null, false,
          req.flash('message', 'Password must contain minimum eight characters, ' +
                               'at least one letter, one number and one special character!'))
      }

      // Generate hash of the  password and insert user into db
      bcrypt.hash(password, 12)
        .then(hash => {
          return db.users.insert(username, hash)
        })
        .then(user => {
          return done(null, user.user_name)
        })
        .catch(error => {
          if (error.code === '23505') { // UNIQUENESS_VIOLATION
            return done(null, false, req.flash('message', 'The user name is already taken.'))
          }
          return done(error)
        })
    }))

  passport.use('local-login', new LocalStrategy({ passReqToCallback: true },
    (req, username, password, done) => {
      // Validate username and password
      if (!usernameRegex.test(username)) {
        return done(null, false,
          req.flash('message', 'Username must contain only letters, numbers and underscores!'))
      }
      if (!passwordRegex.test(password)) {
        return done(null, false,
          req.flash('message', 'Password must contain minimum eight characters, ' +
                               'at least one letter, one number and one special character!'))
      }

      db.users.select(username)
        .then(user => {
          if (!user) {
            return done(null, false,
              req.flash('message', 'The user is not registered. Please signup.'))
          }
          bcrypt.compare(password, user.password, (error, match) => {
            if (error) {
              return done(error)
            }
            if (!match) {
              return done(null, false,
                req.flash('message', 'The password is incorect. Please try again.'))
            }
            return done(null, username)
          })
        })
        .catch(error => {
          return done(error)
        })
    }))

  passport.serializeUser((userName, done) => {
    done(null, userName)
  })

  passport.deserializeUser((userName: string, done) => {
    db.users.select(userName)
      .then(user => {
        if (!user) {
          return done(null)
        }
        return done(null, user)
      })
      .catch(error => {
        return done(error)
      })
  })
}
