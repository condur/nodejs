import * as promise from 'bluebird'
import * as pgPromise from 'pg-promise'

import { IExtensions, UsersRepository } from './repos'

// pg-promise initialization options:
const initOptions: pgPromise.IOptions<IExtensions> = {

  // Using a custom promise library, instead of the default ES6 Promise.
  // To make the custom promise protocol visible, you need to patch the
  // following file: node_modules/pg-promise/typescript/ext-promise.d.ts
  promiseLib: promise,

  // Extending the database protocol with our custom repositories;
  // API: http://vitaly-t.github.io/pg-promise/global.html#event:extend
  extend(obj: IExtensions, dc: any) {
    // Database Context (dc) is mainly needed for extending multiple databases
    // with different access API.
    // Do not use 'require()' here, because this event occurs for every task
    // and transaction being executed, which should be as fast as possible.
    obj.users = new UsersRepository(obj, pgp)
  }
};

// Database connection parameters:
const config = {
  host: process.env.NODEJS_DB_HOST,
  port: parseInt(process.env.NODEJS_DB_PORT),
  database: process.env.NODEJS_DB_NAME,
  user: process.env.NODEJS_DB_USER,
  password: process.env.NODEJS_DB_PASSWORD
}

const pgp: pgPromise.IMain = pgPromise(initOptions)

// Create the database instance with extensions:
const db = <pgPromise.IDatabase<IExtensions> & IExtensions>pgp(config)

export = db
