module.exports = class OASRequestError extends Error {
  constructor (message) {
    super(message)
    this.message = message
    this.name = this.constructor.name
    Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain
  }
}
