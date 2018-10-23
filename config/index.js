
const environments = {}

environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging',
  'hashingSecret': 'mySecret',
  'mailgun': {
    'apiKey': `${process.env.MAILGUN_API_KEY}`,
    'domainName': `${process.env.MAILGUN_DOMAIN_NAME}`
  },
  'stripe': {
    'token': `${process.env.STRIPE_TOKEN}`,
    'apiKey': `${process.env.STRIPE_API_KEY}`
  }
}

environments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production',
  'hashingSecret': 'mySecret production'
}

const currentEnvironment = typeof
(process.env.NODE_ENV === 'string'
  ? process.env.NODE_ENV.toLowerCase() : ''
)

const environmentToExport = typeof
(environments[currentEnvironment]) === 'object'
  ? environments[currentEnvironment]
  : environments.staging

module.exports = environmentToExport
