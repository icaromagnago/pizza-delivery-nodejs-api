
const environments = {};

environments.staging = {
  httpPort: 3000,
  baseDomain: 'http://localhost',
  envName: 'staging',
  hashingSecret: 'WyCNbfkIP345'
};

environments.production = {
  httpPort: 3000,
  baseDomain: 'http://localhost',
  envName: 'production',
  hashingSecret: 'GHusdKASEh67f'
};

const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';
const moduleToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = moduleToExport;