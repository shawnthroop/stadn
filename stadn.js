var ADNClient = require('./stadnclient'),
    ADNModel = require('./stadnmodel');

var STADN = STADN || {
  Client: function(configPath) {
    return new ADNClient(configPath);
  },
  Model: function(configPath) {
    return new ADNModel();
  }
}

module.exports = STADN;
