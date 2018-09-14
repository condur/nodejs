export let get = () => {
  const pkg = require('../../package.json')
  return pkg.version
}
