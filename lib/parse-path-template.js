// helper
module.exports = function (src, params = {}) {
  // find all parameters
  const results = src.matchAll(/\{(?<param>[^/]+)\}/g)

  for (const { groups: { param } } of results) {
    const regex = new RegExp(`{${param}}`, 'g')

    // only replace if value exists
    if (params[param]) {
      src = src.replace(regex, params[param])
    }
  }

  return src
}
