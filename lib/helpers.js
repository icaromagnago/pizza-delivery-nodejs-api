const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');
const StringDecoder = require('string_decoder').StringDecoder;
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

// Create random string
helpers.createRandomString = (strLength) => {
  if (typeof (strLength) == 'number' && strLength > 0) {
    const possibleCharacters = 'abcdefghijlmopqrstuvwxyz0123456789';

    let str = '';
    for (i = 1; i <= strLength; i++) {
      let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
      str += randomCharacter;
    }

    return str;
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

helpers.isArrayNotEmpty = items => {
  return typeof(items) == 'object' && items instanceof Array && items.length > 0;
};

helpers.sendStripePayment = (payload, callback) => {

  const stringPayload = querystring.stringify(payload);
  console.log(stringPayload);

  const requestDetails = {
    'protocol': 'https:',
    'hostname': config.stripeBaseUrl,
    'method': 'POST',
    'auth': 'sk_test_4eC39HqLyjWDarjtT1zdp7dc:',
    'path': '/v1/charges',
    'headers': {
      'Content-type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(stringPayload)
    }
  };

  const decoder = new StringDecoder('utf-8');
  let buffer = '';

  const req = https.request(requestDetails, (res) => {
    const status = res.statusCode;
    
    res.on('data', (data) => {
      buffer += decoder.write(data);
    });

    res.on('end', () => {
      buffer += decoder.end();
      if (status == 200 || status == 201) {
        callback(false, buffer);
      } else {
        callback(true, buffer);
  
      }
    });
  });

  req.on('error', (err) => {
    callback(err);
  });

  req.write(stringPayload);

  req.end();
};

module.exports = helpers;