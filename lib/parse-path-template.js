// helper
module.exports = function (src, variables = {}, defaults = {}) {
  // find all parameters
  const results = src.matchAll(/\{(?<param>[^/]+)\}/g)

  for (const { groups: { param } } of results) {
    const regex = new RegExp(`{${param}}`, 'g')

    // only replace if value exists
    if (variables[param] || defaults[param]) {
      src = src.replace(regex, variables[param] || defaults[param])
    }
  }

  return src
}
