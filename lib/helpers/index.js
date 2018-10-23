
const crypto = require('crypto')
const https = require('https')
const queryString = require('querystring')
const config = require('../../config')

const helpers = {}

/**
 * Parse a JSON string to an object in all cases,
 * without throwing
 * @param {String} str
 */
helpers.parseJsonToObject = function (str) {
  try {
    const obj = JSON.parse(str)
    return obj
  } catch (e) {
    return {}
  }
}

/**
 * Create a SHA256 hash
 * @param {String} str
 * @return {String|Boolean} hashed value or false
 */
helpers.hash = (str) => {
  if (typeof str === 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha256', config.hashingSecret)
      .update(str).digest('hex')

    return hash
  }

  return false
}

/**
 * Create a string of random alphanumeric characters,
 * of a given length
 * @param {String} strLength
 * @return {String|Boolean} random characters or false
 */
helpers.createRandomString = (strLength) => {
  strLength = typeof (strLength) === 'number' &&
  strLength > 0 ? strLength : false

  if (strLength) {
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789'

    let str = ''

    for (let i = 1; i <= strLength; i++) {
      const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
      str += randomCharacter
    }

    return str
  }
  return false
}
// https://api.mailgun.net/v3

/**
 * Send email using mailgun
 * @param {Object} emailData object containing data for messages to be sent
 *
 * @return {Promise} Promise
 */
helpers.sendEmail = (emailData) => {
  // Validate parameters
  let containsAllRequiredMailgunData
  ['email', 'body'].forEach((property) => {
    if (emailData[property]) {
      containsAllRequiredMailgunData = true
    }
  })

  const email = typeof emailData.email === 'string' ? emailData.email : false
  const subject = typeof emailData.subject === 'string' ? emailData.subject : false
  const body = typeof emailData.body === 'string' ? emailData.body : false

  return new Promise((resolve, reject) => {
    if (
      containsAllRequiredMailgunData &&
      email && body && subject
    ) {
      // Configure the request payload Testing some Mailgun awesomeness!
      const payload = {
        from: `<${config.mailgun.domainName}>`,
        to: email,
        subject,
        text: body
      }

      const stringPayload = queryString.stringify(payload)

      const requestDetails = {
        'protocol': 'https:',
        'hostname': 'api.mailgun.net',
        'method': 'POST',
        'path': `/v3/${config.mailgun.domainName}`,
        'auth': `api:${config.mailgun.apiKey}`,
        'headers': {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(stringPayload)
        }
      }

      // Instantiate the request object
      const req = https.request(requestDetails, (res) => {
        // Grab the status of the sent request
        const status = res.statusCode
        // Callback successfully if the request went through
        if (status === 200 || status === 201) {
          return resolve(false)
        }

        reject(new Error(`Status code returned was ${status}`))
      })

      // Bind to the error event so it doesn't get thrown
      req.on('error', (e) => {
        reject(e)
      })
      // Add the payload
      req.write(stringPayload)

      // End the request
      return req.end()
    }

    const stripePayloadError = new Error()
    stripePayloadError.message = 'Given parameters were missing or invalid'
    reject(stripePayloadError)
  })
}
/**
 * Send text messages using Twilio
 * @param {String} phone user's phone number
 * @param {String} msg message to be sent to user
 *
 * @return {Promise} Promise
 */
helpers.makeStripePayment = (stripeChargeData) => {
  let containsAllRequiredStripeData
  ['amount', 'source', 'description', 'currency'].forEach((property) => {
    if (stripeChargeData[property]) {
      containsAllRequiredStripeData = true
    }
  })

  const amount = typeof stripeChargeData.amount === 'number' ? stripeChargeData.amount : false
  const source = typeof stripeChargeData.source === 'string' ? stripeChargeData.source : false
  const description = typeof stripeChargeData.description === 'string' ? stripeChargeData.description : false
  const currency = typeof stripeChargeData.description === 'string' ? stripeChargeData.currency : false

  return new Promise((resolve, reject) => {
    if (
      containsAllRequiredStripeData &&
      amount && source && description && currency
    ) {
      // Configure the request payload
      const payload = {
        amount,
        source,
        description,
        currency
      }

      const stringPayload = queryString.stringify(payload)
      // Configure the request details
      const requestDetails = {
        'protocol': 'https:',
        'hostname': 'api.stripe.com',
        'method': 'POST',
        'path': '/v1/charges',
        'auth': `${config.stripe.apiKey}`,
        'headers': {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(stringPayload)
        }
      }

      // Instantiate the request object
      const req = https.request(requestDetails, (res) => {
        // Grab the status of the sent request
        const status = res.statusCode
        // Callback successfully if the request went through
        if (status === 200 || status === 201) {
          return resolve(false)
        }

        reject(new Error(`Status code returned was ${status}`))
      })

      // Bind to the error event so it doesn't get thrown
      req.on('error', (e) => {
        reject(e)
      })
      // Add the payload
      req.write(stringPayload)

      // End the request
      return req.end()
    }

    const stripePayloadError = new Error()
    stripePayloadError.message = 'Given parameters were missing or invalid'
    reject(stripePayloadError)
  })
}
module.exports = helpers
