const crypto = require('crypto');
const config = require('./config');

const helpers = {};

helpers.parseJsonToObject = str => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
};

helpers.hash = str => {
  if (typeof (str) == 'string' && str.length > 0) {
    return crypto
      .createHash('sha256', config.hashingSecret)
      .update(str)
      .digest('hex');
  } else {
    return false;
  }
};

helpers.isStringNotEmpty = str => {
  return typeof(str) == 'string' && str.trim().length > 0;
};

helpers.isEmailValid = email => {
  return helpers.isStringNotEmpty(email) && email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
};

helpers.isPasswordValid = (password) => {
  return typeof(password) == 'string' && password.trim().length > 4; 
};

module.exports = helpers;