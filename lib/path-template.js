// helper
module.exports = function (path, params = {}) {
  // find all parameters
  const results = path.matchAll(/\{(?<param>[^/]+)\}/g)

  for (const { groups: { param } } of results) {
    const regex = new RegExp(`{${param}}`, 'g')

    // only replace if value exists
    if (params[param]) {
      path = path.replace(regex, params[param])
    }
  }

  return path
}
