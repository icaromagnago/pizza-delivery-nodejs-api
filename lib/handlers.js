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

// Required: Name, email, password and address
handlers._users.post = (data, callback) => {
  const { name, email, password, address } = data.payload;

  const validationErrors = {};

  if (!helpers.isStringNotEmpty(name)) {
    validationErrors.name = 'name is required';
  }
  if (!helpers.isEmailValid(email)) {
    validationErrors.email = 'invalid email';
  }
  if (!helpers.isStringNotEmpty(password)) {
    validationErrors.password = 'invalid password';
  }
  if (!helpers.isStringNotEmpty(address)) {
    validationErrors.address = 'address is required';
  }

  if (Object.keys(validationErrors).length === 0) {
    _data.read('users', email, (err, userData) => {
      if (err) {
        const hashedPassword = helpers.hash(password);
  
        if (hashedPassword) {
          const user = {
            name,
            email,
            address,
            'password': hashedPassword
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
          callback(500, { 'Error': 'Could not hash the user\'s password' });
        }
  
      } else {
        callback(400, { 'Error': 'A user with that email already exists' });
      }
    });
  } else {
    callback(400, validationErrors);
  }
};

handlers._users.get = (data, callback) => {
  const email = data.queryStringObject.get('email');

  if (helpers.isEmailValid(email)) {
    _data.read('users', email, (err, userData) => {
      if (!err && userData) {
        delete userData.password;
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
// Optional: password, name and address (at least one must be provided)
handlers._users.put = (data, callback) => {
  const { email, name, address, password } = data.payload;

  const isNameValid = helpers.isStringNotEmpty(name);
  const isAddressValid = helpers.isStringNotEmpty(address);
  const isPasswordValid = helpers.isPasswordValid(password);

  if (helpers.isEmailValid(email)) {
    if (isNameValid || isAddressValid || isPasswordValid) {
      _data.read('users', email, (err, userData) => {
        if (!err && userData) {
          if (isNameValid) {
            userData.name = name;
          }
          if (isAddressValid) {
            userData.address = address;
          }
          if (isPasswordValid) {
            userData.password = helpers.hash(password);
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