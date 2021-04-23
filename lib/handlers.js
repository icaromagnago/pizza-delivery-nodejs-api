const helpers = require("./helpers");
const _data = require('./data');

const handlers = {};

handlers.users = (data, callback) => {
  const allowedMethods = ['post', 'get', 'put', 'delete'];
  if (allowedMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._users = {};

// Required: Name, email and address
handlers._users.post = (data, callback) => {
  const { name, email, address } = data.payload;

  const isNameValid = helpers.isStringNotEmpty(name);
  const isEmailValid = helpers.isEmailValid(email);
  const isAddressValid = helpers.isStringNotEmpty(address);

  if (isNameValid && isEmailValid && isAddressValid) {
    _data.read('users', email, (err, userData) => {
      if (err) {
        const user = {
          name,
          email,
          address
        };

        _data.create('users', email, user, (err) => {
          if (!err) {
            callback(200);
          } else {
            console.log(err);
            callback(500, { 'Error': 'Could not create the new user' });
          }
        });
      } else {
        callback(400, { 'Error': 'A user with that email already exists' });
      }
    });
  } else {
    callback(400, {'Error': 'Missing required fields or invalid fields'});
  }
};

handlers._users.get = (data, callback) => {
  const email = data.queryStringObject.get('email');

  if (helpers.isEmailValid(email)) {
    _data.read('users', email, (err, userData) => {
      if (!err && userData) {
        callback(200, userData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(404, { 'Error': 'Could not find the user' });
  }
};

// Required: email
// Optional: name and address (at least one must be provided)
handlers._users.put = (data, callback) => {
  const { email, name, address } = data.payload;

  const isNameValid = helpers.isStringNotEmpty(name);
  const isAddressValid = helpers.isStringNotEmpty(address);

  if (helpers.isEmailValid(email)) {
    if (isNameValid || isAddressValid) {
      _data.read('users', email, (err, userData) => {
        if (!err && userData) {
          if (isNameValid) {
            userData.name = name;
          }
          if (isAddressValid) {
            userData.address = address;
          }
          _data.update('users', email, userData, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(500, { 'Error': 'Could not update the user' });
            }
          });

        } else {
          callback(400, { 'Error': 'The specified user does not exists' });
        }
      });

    } else {
      callback(400, { 'Error': 'Missing fields to update' });
    }
  } else {
    callback(400, { 'Error': 'Invalid email' });
  }
};

handlers._users.delete = (data, callback) => {
  const email = data.queryStringObject.get('email');

  if (helpers.isEmailValid(email)) {
    _data.read('users', email, (err, userData) => {
      if (!err) {
        _data.delete('users', email, (err) => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { 'Error': 'Could not delete the user' });
          }
        });
      } else {
        callback(404, { 'Error': 'Could not find the user' });
      }
    });
  } else {
    callback(404, { 'Error': 'Could not find the user' });
  }
  
};

handlers.notFound = (data, callback) => {
  callback(404, {'Error': `No handler found for path '${data.trimmedPath}'`});
};

module.exports = handlers;