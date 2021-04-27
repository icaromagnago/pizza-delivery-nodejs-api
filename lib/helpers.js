const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');

const helpers = {};

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

// Get Stripe token for payment
helpers.getStripeToken = (
  cardName, 
  cardNumber, 
  cardExpirationMonth, 
  cardExpirationYear, 
  cardCvc,
  callback
) => {

  // querystring.stringfy can't stringfy nested objects
  const stringPayload = `card[name]=${cardName}&card[number]=${cardNumber}&card[exp_month]=${cardExpirationMonth}&card[exp_year]=${cardExpirationYear}&card[cvc]=${cardCvc}`;

  const requestDetails = {
    'protocol': 'https:',
    'hostname': config.stripeClient.baseUrl,
    'method': 'POST',
    'auth': config.stripeClient.secret,
    'path': '/v1/tokens',
    'headers': {
      'Content-type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(stringPayload)
    }
  };

  // Create https request
  const req = https.request(requestDetails, (res) => {
    const status = res.statusCode;
    
    const decoder = new StringDecoder('utf-8');
    let buffer = '';

    // get the response
    res.on('data', (data) => {
      buffer += decoder.write(data);
    });

    res.on('end', () => {
      buffer += decoder.end();
      const tokenObject = helpers.parseJsonToObject(buffer);

      if (status == 200 || status == 201) {
        callback(false, tokenObject);
      } else {
        console.log(`Could not get stripe token response: ${status}:\n${buffer}`);
        callback(true, tokenObject);
      }
    });
  });

  // In case of request error 
  req.on('error', (err) => {
    console.log('Error in getting token from stripe client: '+ err);
    callback(err);
  });

  // write payload to request
  req.write(stringPayload);

  // Send request
  req.end();
};

// Stripe Payment
helpers.sendStripePayment = (
  total, 
  cardName, 
  cardNumber, 
  cardExpirationMonth, 
  cardExpirationYear, 
  cardCvc, 
  callback
) => {

  helpers.getStripeToken(cardName, cardNumber, cardExpirationMonth, cardExpirationYear, cardCvc, (err, token) => {
    if (!err) {
      const payload = {
        'amount': total * 100, // convert to cents
        'currency': 'usd',
        'source': token.id,
        'description': 'Pizza Delivery App'
      };
    
      const stringPayload = querystring.stringify(payload);
    
      const requestDetails = {
        'protocol': 'https:',
        'hostname': config.stripeClient.baseUrl,
        'method': 'POST',
        'auth': config.stripeClient.secret,
        'path': '/v1/charges',
        'headers': {
          'Content-type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(stringPayload)
        }
      };
    
      // Create the request
      const req = https.request(requestDetails, (res) => {
        const status = res.statusCode;
        
        const decoder = new StringDecoder('utf-8');
        let buffer = '';
        
        // Get the response
        res.on('data', (data) => {
          buffer += decoder.write(data);
        });
    
        res.on('end', () => {
          buffer += decoder.end();
          if (status == 200 || status == 201) {
            callback(false, buffer);
          } else {
            console.log(`Could not get stripe payment response: ${status}:\n${buffer}`);
            callback(true, buffer);
          }
        });
      });
    
      // In case of request error
      req.on('error', (err) => {
        console.log('Error in stripe request: '+ err);
        callback(err);
      });
    
      // Write payload do the request
      req.write(stringPayload);
    
      // Send the request
      req.end();
    } else {
      callback(500, { 'Error': 'Could not get payment token: '+token});
    }
  });
};

helpers.sendEmail = (email, orderId, total, callback) => {

  const payload = {
    from: config.mailgun.from,
    to: email,
    subject: 'Your order receipt',
    text: `Your order: ${orderId}\n Amount: $ ${total}`
  };

  const stringPayload = querystring.stringify(payload);

  const requestDetails = {
    'protocol': 'https:',
    'hostname': config.mailgun.baseUrl,
    'method': 'POST',
    'auth': `api:${config.mailgun.apiKey}`,
    'path': `/v3/${config.mailgun.myDomain}/messages`,
    'headers': {
      'Content-type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(stringPayload)
    }
  };

  const req = https.request(requestDetails, (res) => {
    const status = res.statusCode;

    if (status == 200 || status == 201) {
      callback(false);
    } else {
      console.log(`Could not send email, response status: ${status}`);
      callback(true);
    }
  });

  // In case of request error
  req.on('error', (err) => {
    console.log('Error sending email request: '+ err);
    callback(err);
  });

  // Write payload do the request
  req.write(stringPayload);

  // Send the request
  req.end();
};

module.exports = helpers;