import { IDatabase, IMain } from 'pg-promise'
import sql from '../sql'

export class UsersRepository {
  constructor (db: any, pgp: IMain) {
    this.db = db
    this.pgp = pgp
  }

  private db: IDatabase<any> // eslint-disable-line no-undef
  private pgp: IMain // eslint-disable-line no-undef

  insert (username: string, password: string) {
    return this.db.one(sql.user.insert, {
      username: username,
      password: password
    })
  }

  select (username: string) {
    return this.db.oneOrNone(sql.user.select, {
      username: username
    })
  }
}
