import { UsersRepository } from './users'

// Database Interface Extensions:
interface IExtensions { // eslint-disable-line no-undef
  users: UsersRepository // eslint-disable-line no-undef
}

export {
  IExtensions, // eslint-disable-line no-undef
  UsersRepository // eslint-disable-line no-undef
}
