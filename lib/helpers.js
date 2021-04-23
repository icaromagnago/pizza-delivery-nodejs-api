const helpers = {};

helpers.parseJsonToObject = str => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
};

helpers.isStringNotEmpty = str => {
  return typeof(str) == 'string' && str.trim().length > 0;
};

helpers.isEmailValid = email => {
  return helpers.isStringNotEmpty(email) && email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
}

module.exports = helpers;