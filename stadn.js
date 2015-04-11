var ADNClient = require('./stadnclient');

var STADN = STADN || {
  Client: function(configPath) {
    return new ADNClient(configPath);
  }
}

module.exports = STADN;
