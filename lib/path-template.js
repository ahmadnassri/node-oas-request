// helper
module.exports = function (path, params = {}) {
  // find all parameters
  const results = path.matchAll(/\{(?<param>[^/]+)\}/g)

  for (const { groups: { param } } of results) {
    const regex = new RegExp(`{${param}}`, 'g')
    path = path.replace(regex, params[param])
  }

  return path
}
