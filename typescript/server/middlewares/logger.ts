import { RequestHandler, Request, Response, NextFunction } from 'express' // eslint-disable-line no-unused-vars

export let logger: RequestHandler =
  (req: Request & { _startAt, _startTime },
    res: Response & { _startAt, _startTime },
    next: NextFunction) => {
    // request data
    req._startAt = undefined
    req._startTime = undefined

    // response data
    res._startAt = undefined
    res._startTime = undefined

    // record request start time
    recordStartTime.call(req)

    function logRequest () {
      res.removeListener('finish', logRequest)
      res.removeListener('close', logRequest)

      // record response start time
      recordStartTime.call(res)

      // Collect request/response data
      var data = {
        remote_addr: getip(req),
        method: getMethod(req),
        url: requestURL(req),
        status: getStatus(res),
        user_agent: getUserAgent(req),
        res_time_ms: getResponseTime(req, res, 0),
        refferer: getReferrer(req)
      }

      console.log(JSON.stringify(data))
    }

    res.on('finish', logRequest)
    res.on('close', logRequest)

    next()
  }

/**
 * Get request IP address.
 *
 * @param {IncomingMessage} req
 * @return {string}
 */
function getip (req) {
  return req.ip ||
    req._remoteAddress ||
    (req.connection && req.connection.remoteAddress) ||
    undefined
}

/**
 * Get Request Id
 *
 * @param {object} res
 * @param {string} reqIdHeaderName
 * @return {string}
 */
function getRequestId (res, reqIdHeaderName) { // eslint-disable-line no-unused-vars
  return res.getHeader(reqIdHeaderName)
}

/**
 * Get HTTP version
 *
 * @private
 * @param {IncomingMessage} req
 * @return {string}
 */
function getHttpVersion (req) { // eslint-disable-line no-unused-vars
  return req.httpVersionMajor + '.' + req.httpVersionMinor
}

/**
 * Get request URL
 *
 * @private
 * @param {IncomingMessage} req
 * @return {string}
 */
function requestURL (req) {
  return req.originalUrl || req.url
}

/**
 * Get request method
 *
 * @private
 * @param {IncomingMessage} req
 * @return {string}
 */
function getMethod (req) {
  return req.method
}

/**
 * Get User Agent
 *
 * @private
 * @param {IncomingMessage} req
 * @return {string}
 */
function getUserAgent (req) {
  return req.headers['user-agent']
}

/**
 * Determine if the response headers have been sent.
 *
 * @private
 * @param {object} res
 * @returns {boolean}
 */
function headersSent (res) {
  return typeof res.headersSent !== 'boolean' ? Boolean(res._header) : res.headersSent
}

/**
 * Get response header
 *
 * @private
 * @param {IncomingMessage} req
 * @param {object} res
 * @param {String} field
 * @returns {String}
 */
function getResponseHeader (req, res, field) { // eslint-disable-line no-unused-vars
  if (!headersSent(res)) {
    return undefined
  }

  // get header
  var header = res.getHeader(field)

  return Array.isArray(header) ? header.join(', ') : header
}

/**
 * Get response status code
 *
 * @private
 * @param {object} res
 * @returns {String}
 */
function getStatus (res) {
  return headersSent(res) ? String(res.statusCode) : undefined
}

/**
 * Get refferer
 *
 * @private
 * @param {IncomingMessage} req
 * @returns {boolean}
 */
function getReferrer (req) {
  return req.headers['referer'] || req.headers['referrer']
}

/**
 * Record the start time.
 * @private
 */
function recordStartTime () {
  this._startAt = process.hrtime()
  this._startTime = new Date()
}

/**
 * Get response time in milliseconds
 * @param {IncomingMessage} req
 * @param {object} res
 * @param {number} digits
 * @returns {number}
 */
function getResponseTime (req, res, digits) {
  if (!req._startAt || !res._startAt) {
    // missing request and/or response start time
    return
  }

  // calculate diff
  var ms = (res._startAt[0] - req._startAt[0]) * 1e3 + (res._startAt[1] - req._startAt[1]) * 1e-6

  // return truncated value
  return ms.toFixed(digits === undefined ? 3 : digits)
}
