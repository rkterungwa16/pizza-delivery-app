
const environments = {}

environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging',
  'hashingSecret': 'mySecret',
  'mailgun': {
    'apiKey': 'dc907ce2d62fb7922eff442c33128eb9-a3d67641-21784bd5',
    'domainName': 'sandbox1cca373d00b9498ca464e20244cd5c23.mailgun.org'
  },
  'stripe': {
    'token': 'tok_mastercard',
    'apiKey': 'sk_test_GtHfD0ZaRWx8N6loxR2oGKsO'
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
