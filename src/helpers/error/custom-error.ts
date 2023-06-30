import ErrorCodes from './error-codes'

/**
 * Custom error object.
 * By the error code it substitutes the desired message from object 'errors'
 * @extends Error
 */

export default class CustomError extends Error {
  name: string
  message: string

  constructor(code: string) {
    super(code)
    this.name = 'CustomError'
    this.message = ErrorCodes.hasOwnProperty(code)
      ? `${code}: ${ErrorCodes[code]}`
      : 'Uncaught error'

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = new Error().stack
    }
  }
}
