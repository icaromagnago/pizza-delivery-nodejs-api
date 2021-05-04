
const environments = {};

environments.staging = {
  httpPort: 3000,
  baseDomain: 'http://localhost',
  envName: 'staging',
  hashingSecret: 'WyCNbfkIP345',
  stripeClient: {
    baseUrl: 'api.stripe.com',
    secret: 'sk_test_4eC39HqLyjWDarjtT1zdp7dc:'
  },
  mailgun: {
    baseUrl: 'api.mailgun.net',
    apiKey: 'YOUR_API_KEY',
    from: 'YOUR_DOMAIN_EMAIL',
    myDomain: 'YOUR_DOMAIN'
  },
  'templateGlobals': {
    'appName': 'PizzaDelivery',
    'companyName': 'NotARealCompany, Inc',
    'yearCreated': '2018',
    'baseUrl': 'http://localhost:3000/'
  }
};

environments.production = {
  httpPort: 3000,
  baseDomain: 'http://localhost',
  envName: 'production',
  hashingSecret: 'GHusdKASEh67f',
  stripeClient: {
    baseUrl: 'api.stripe.com',
    secret: 'sk_test_4eC39HqLyjWDarjtT1zdp7dc:'
  },
  mailgun: {
    baseUrl: '',
    apiKey: '',
    from: '',
    myDomain: ''
  },
  'templateGlobals': {
    'appName': 'PizzaDelivery',
    'companyName': 'NotARealCompany, Inc',
    'yearCreated': '2018',
    'baseUrl': 'http://localhost:3000/'
  }
};

const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';
const moduleToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = moduleToExport;