const helpers = require("./helpers");
const _data = require('./data');

// Container for handlers
const handlers = {};

/**
 * HTML handlers
 */
// Index
 handlers.index = (data, callback) => {
  // Reject any request that ins't a GET
  if (data.method == 'get') {

    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Pizza Delivery',
      'head.description': 'Pizza Delivery - The best pizza in the world',
      'body.class': 'index'
    };

    // Read in a template as a string
    helpers.getTemplate('index', templateData, (err, str) => {
      if (!err && str) {
        helpers.addUniversalTemplates(str, templateData, (err, fullString) => {
          if (!err && fullString) {
            callback(200, fullString, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {  
    callback(405, undefined, 'html');
  }
};

// Favicon
handlers.favicon = (data, callback) => {
  // Reject any request that ins't a GET
  if (data.method == 'get') { 
    helpers.getStaticAsset('favicon.ico', (err, data) => {
      if (!err && data) {
        callback(200, data, 'favicon');
      } else {
        callback(500);
      }
    });
  } else {  
    callback(405, undefined, 'html');
  }
};

// Public assets
handlers.public = (data, callback) => {
  if (data.method == 'get') { 
    const trimmedAssetName = data.trimmedPath.replace('public/', '').trim();
    
    if (trimmedAssetName.length > 0) {
      helpers.getStaticAsset(trimmedAssetName, (err, data) => {
        if (!err && data) {
          let contentType = 'plain';

          if (trimmedAssetName.indexOf('.css') > -1) {
            contentType = 'css';
          }

          if (trimmedAssetName.indexOf('.png') > -1) {
            contentType = 'png';
          }

          if (trimmedAssetName.indexOf('.jpg') > -1) {
            contentType = 'jpg';
          }

          if (trimmedAssetName.indexOf('.ico') > -1) {
            contentType = 'favicon';
          }

          callback(200, data, contentType);

        } else {
          callback(404);
        }
      });
    }
  } else {  
    callback(405);
  }
};

// Create account
handlers.accountCreate = (data, callback) => {
  // Reject any request that ins't a GET
  if (data.method == 'get') {

    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Create an Account',
      'head.description': 'Signup is easy and only take a few seconds',
      'body.class': 'accountCreate'
    };

    // Read in a template as a string
    helpers.getTemplate('accountCreate', templateData, (err, str) => {
      if (!err && str) {
        helpers.addUniversalTemplates(str, templateData, (err, fullString) => {
          if (!err && fullString) {
            callback(200, fullString, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {  
    callback(405, undefined, 'html');
  }
};

// Create New Session
handlers.sessionCreate = (data, callback) => {
  // Reject any request that ins't a GET
  if (data.method == 'get') {

    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Login to your Account',
      'head.description': 'Please enter your email and password to access your account',
      'body.class': 'sessionCreate'
    };

    // Read in a template as a string
    helpers.getTemplate('sessionCreate', templateData, (err, str) => {
      if (!err && str) {
        helpers.addUniversalTemplates(str, templateData, (err, fullString) => {
          if (!err && fullString) {
            callback(200, fullString, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {  
    callback(405, undefined, 'html');
  }
};


// Handler for users
handlers.users = (data, callback) => {
  const allowedMethods = ['post', 'get', 'put', 'delete'];
  if (allowedMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the users methods
handlers._users = {};

// POST
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

// GET
// Required data: email
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

// PUT
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

// DELETE
// Required data: email
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

// Handler for tokens
handlers.tokens = (data, callback) => {
  const allowedMethods = ['post', 'delete'];
  if (allowedMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the tokens methods
handlers._tokens = {};

// POST
// Required data: Email and password
handlers._tokens.post = (data, callback) => {
  const { email, password } = data.payload;

  const validationErrors = {};

  if (!helpers.isStringNotEmpty(email)) {
    validationErrors.email = 'required field';
  }
  if (!helpers.isStringNotEmpty(password)) {
    validationErrors.password = 'required field';
  }

  if (Object.keys(validationErrors).length === 0) {
    _data.read('users', email, (err, userData) => {
      if (!err && userData) {
        const hashedPassword = helpers.hash(password);
        if (hashedPassword) {
          if (userData.password === hashedPassword) {
            const tokenId = helpers.createRandomString(20);
            const TokenObject = {
              email,
              'id': tokenId,
              'expires': Date.now() + 1000 * 60 * 60
            };

            _data.create('tokens', tokenId, TokenObject, (err) => {
              if (!err) {
                callback(201, TokenObject);
              } else {
                callback(500, { 'Error': 'Could not create token' });
              }
            });
          } else {
            callback(400, { 'Error': 'Invalid login' })
          }
        } else {
          callback(500, { 'Error': 'Could not hash the user\'s password' });
        }
      } else {
        callback(404, { 'Error': 'User does not exists' });
      }
    });
  } else {
    callback(400, validationErrors);
  }
};

// DELETE
// Required data: token id
handlers._tokens.delete = (data, callback) => {
  const id = data.queryStringObject.get('id');

  if (helpers.isStringNotEmpty(id)) {
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        _data.delete('tokens', id, (err) => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { 'Error': 'Could not delete the token' });
          }
        });
      } else {
        callback(404, { 'Error': 'Could not find the token' });
      }
    });
  } else {
    callback(400, { 'Error': 'id is required' });
  }
};

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (token, email, callback) => {
  _data.read('tokens', token, (err, tokenData) => {
    if (!err && tokenData) {
      if (tokenData.email == email && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

// Handler for menu items
handlers.items = (data, callback) => {
  const allowedMethods = ['get'];
  if (allowedMethods.indexOf(data.method) > -1) {
    handlers._items[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the menu items methods
handlers._items = {};

// GET
// Required data: email
// Header: valid token
handlers._items.get = (data, callback) => {
  const email = data.queryStringObject.get('email');

  if (helpers.isStringNotEmpty(email)) {
    const { token } = data.headers;

    handlers._tokens.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        _data.read('menu', 'pizzas', (err, pizzas) => {
          if (!err) {
            callback(200, pizzas);
          } else {
            callback(500, { 'Error': 'Could not retrieve the menu items' });
          }
        });
      } else {
        callback(403, { 'Error': 'Missing required token in header, or token is invalid' });
      }
    });
  } else {
    callback(400, { 'Error': 'email is required' });
  }
};

// Handler for carts
handlers.carts = (data, callback) => {
  const allowedMethods = ['post', 'put', 'get'];
  if (allowedMethods.indexOf(data.method) > -1) {
    handlers._carts[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the all carts methods
handlers._carts = {};

// POST
// Required data: items
// Header: valid token
handlers._carts.post = (data, callback) => {
  const { items } = data.payload;
  const { token } = data.headers;

  if (helpers.isStringNotEmpty(token)) {
    _data.read('tokens', token, (err, tokenData) => {
      if (!err && tokenData) {
        const { email } = tokenData;

        handlers._tokens.verifyToken(token, email, (tokenIsValid) => {
          if (tokenIsValid) {
            if (typeof(items) == 'object' && items instanceof Array && items.length > 0) {
              _data.read('users', email, (err, userData) => {
                if (!err && userData) {
                  const cartId = helpers.createRandomString(20);
                  const cartTotal = items.reduce((total, { price, quantity }) => total + (price * quantity), 0);
  
                  const cartObject = {
                    'id': cartId,
                    'total': cartTotal,
                    email,
                    items
                  };
  
                  _data.create('carts', cartId, cartObject, (err) => {
                    if (!err) {
                      // User current cart
                      userData.cartId = cartId;
                      _data.update('users', email, userData, (err) => {
                        if (!err) {
                          callback(200, cartObject);
                        } else {
                          callback(500, { 'Error': 'Could not update user with cart association' });
                        }
                      });
                    } else {
                      callback(500, { 'Error': 'Could not create cart' });
                    }
                  }); 
                } else {
                  callback(404, { 'Error': 'Could not found user' })
                }
              });
            } else {
              callback(400, { 'Error': 'Could not create cart, required fields missing or invalid'});
            }
            
          } else {
            callback(403, { 'Error': 'Invalid token' });
          }
        });
      } else {
        callback(403, { 'Error': 'Invalid token' });
      }
    });
  } else {
    callback(403, { 'Error': 'Missing required token' });
  }
};

// PUT
// Required data: cart id and items
// Header: valid token
handlers._carts.put = (data, callback) => {
  const { id, items } = data.payload;
  const { token } = data.headers;

  const isIdValid = helpers.isStringNotEmpty(id);
  const isItemsValid = helpers.isArrayNotEmpty(items);

  if (helpers.isStringNotEmpty(token)) {
    _data.read('carts', id, (err, cartData) => {
      if (!err && cartData) {
        const { email } = cartData;

        handlers._tokens.verifyToken(token, email, (tokenIsValid) => {
          if (tokenIsValid) {
            if (isIdValid && isItemsValid) {               
              const cartTotal = items.reduce((total, { price, quantity }) => total + (price * quantity), 0);
              cartData.items = items;
              cartData.total = cartTotal;

              _data.update('carts', id, cartData, (err) => {
                if (!err) {
                  callback(200, cartData);
                } else {
                  callback(500, { 'Error': 'Could not update cart' });
                }
              });
             
            } else {
              callback(400, { 'Error': 'Could not update cart, required fields missing or invalid'});
            }
          } else {
            callback(403, { 'Error': 'Invalid token' });
          }
        });
      } else {
        callback(404, { 'Error': 'Cart not found' });
      }
    });
  } else {
    callback(403, { 'Error': 'Missing required token' });
  }
};

// GET
// Required data: id
// Header: valid token
handlers._carts.get = (data, callback) => {
  const id = data.queryStringObject.get('id');
  const { token } = data.headers;

  if (helpers.isStringNotEmpty(token)) {
    if (helpers.isStringNotEmpty(id)) {
      _data.read('carts', id, (err, cartData) => {
        if (!err) {
          const { email } = cartData;
          handlers._tokens.verifyToken(token, email, (tokenIsValid) => {
            if (tokenIsValid) {
              callback(200, cartData);
            } else {
              callback(403, { 'Error': 'Invalid token' });
            }
          });
        } else {
          callback(404, { 'Error': 'Cart not found' });
        }
      });
    } else {
      callback(400, { 'Error': 'Missing required id' });
    }
  } else {
    callback(403, { 'Error': 'Missing required token' });
  }
}

// Handler for orders
// Header: valid token
handlers.orders = (data, callback) => {
  const allowedMethods = ['post'];
  if (allowedMethods.indexOf(data.method) > -1) {
    handlers._orders[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the orders methods
handlers._orders = {};

// POST
// Required data: cartId,
// cardName, cardNumber, cardExpirationMonth, cardExpirationYear and cardCvc
handlers._orders.post = (data, callback) => {
  const { 
    cartId, 
    cardName, 
    cardNumber, 
    cardExpirationMonth, 
    cardExpirationYear, 
    cardCvc 
  } = data.payload;

  const validationErrors = {};

  if (!helpers.isStringNotEmpty(cartId)) {
    validationErrors.cartId = 'cart id is required';
  }
  if (!helpers.isStringNotEmpty(cardName)) {
    validationErrors.cardName = 'card name is required';
  }
  if (!helpers.isStringNotEmpty(cardNumber)) {
    validationErrors.cardNumber = 'card number is required';
  }
  if (!helpers.isStringNotEmpty(cardExpirationMonth)) {
    validationErrors.cardExpirationMonth = 'expiration month is required';
  }
  if (!helpers.isStringNotEmpty(cardExpirationYear)) {
    validationErrors.cardExpirationYear = 'expiration year is required';
  }
  if (!helpers.isStringNotEmpty(cardCvc)) {
    validationErrors.cardCvc = 'cvc is required';
  }

  if (Object.keys(validationErrors).length === 0) {
    const { token } = data.headers;

    _data.read('carts', cartId, (err, cartData) => {
      if (!err && cartData) {
        const { email, total } = cartData;
        handlers._tokens.verifyToken(token, email, (tokenIsValid) => {
          if (tokenIsValid) {
            const orderId = helpers.createRandomString(20);

            const orderObject = {
              'id': orderId,
              email,
              cartId,
              'paymentStatus': 'PENDING'
            };

            _data.create('orders', orderId, orderObject, (err) => {
              if (!err) {
                _data.read('users', email, (err, userData) => {
                  if (!err && userData) {
                    let { orders } = userData;
                    orders = typeof(orders) == 'object' && orders instanceof Array ? orders : [];
                    userData.orders = orders;
                    userData.orders.push(orderId);

                    _data.update('users', email, userData, (err) => {
                      if (!err) {
                        // Send payment to Stripe
                        helpers.sendStripePayment(
                          total, 
                          cardName, 
                          cardNumber, 
                          cardExpirationMonth, 
                          cardExpirationYear, 
                          cardCvc, 
                          (err, responseData) => {
                            if (!err) {
                              orderObject.paymentStatus = 'APPROVED';
                              _data.update('orders', orderId, orderObject, (err) => {
                                if (!err) {
                                  // Send email
                                  helpers.sendEmail(email, orderId, total, (err) => {
                                    if (!err) {
                                      callback(200);
                                    } else {
                                      callback(500, { 'Error': 'Could not send email with the receipt' });
                                    }
                                  });
                                } else {
                                  callback(500,  { 'Error': 'Could not update order with payment status' });
                                }
                              });
                            } else {
                              callback(500, { 'Error': 'Could not process payment' });
                            }
                          });
                      } else {
                        callback(500, { 'Error': 'Could not update user with the new order' });
                      }
                    });

                  } else {
                    callback(500, { 'Error': 'Specified user not found' });
                  }
                });
              } else {
                callback(500, { 'Error': 'Something went wrong. Could not create the order' });
              }
            });

          } else {
            callback(403, { 'Error': 'Invalid token' });
          }
        });
      } else {
        callback(404, { 'Error': 'Cart not found' });
      }
    });
  } else {
    callback(400, validationErrors);
  }
};

handlers.notFound = (data, callback) => {
  callback(404, {'Error': `No handler found for path '${data.trimmedPath}'`});
};

module.exports = handlers;