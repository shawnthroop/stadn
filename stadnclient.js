// An client object that gives access to App.net's API

var request = require('request'),
    querystring = require('querystring'),
    https = require('https');

// var STADNClient = STADNClient || {};

function Client(configPath) {
  if (configPath) {
    var config = require(configPath);
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.appToken = config.appToken;
  // } else {
  //   console.log('Warning: path to config file not provided. Use initialize() to supply your clientId, clientSecret, and appToken.');
  }

  this.token = null;

  // Host URLs for accessing App.net
  this.authHost = 'https://account.app.net';
  this.apiHost = 'https://api.app.net';
}


// Base api request

var apiRequest = function(method, endpoint, headers, postBody, callback) {
  var options = {
    uri: endpoint,
    method: method,
  }

  if (headers) { options.headers = headers }
  if (postBody) { options.body = postBody }

  var req = request(options, function(err, response) {
    if (err)
      return callback(err);

    // Parse JSON
    var body = JSON.parse(response.body);
    return callback(null, body);
  });

  return req;
}


// Base authenticated api request

authedAPIRequest = function(method, endpoint, token, postBody, callback) {
  var headers = {
    Authorization: 'Bearer ' + token,
    'X-ADN-Pretty-JSON': 1,
    'Content-type': 'application/json'
  }
  var stringBody = JSON.stringify(postBody)

  return apiRequest(method, endpoint, headers, stringBody, function(err, body) {
    if (err)
      return callback(err);

    // check for app.net error
    if (body.meta.error_message) {
      var error = new Error(body.meta.error_message);
      error.code = body.meta.code;
      return callback(error);
    }

    return callback(null, body);
  });
}


Client.prototype.initialize = function(clientId, clientSecret, appToken) {
  this.clientId = clientId;
  this.clientSecret = clientSecret;
  this.appToken = appToken;
}


Client.prototype.authenticate = function(callback) {
  if (this.token)
    return callback(null);

  if (!this.clientId || !this.clientSecret)
    return callback(new Error('Must supply both a clientId and clientSecret before an access token can be fetched'));

  var endpoint = this.authHost + '/oauth/access_token';
  var headers = { 'Content-type': 'application/x-www-form-urlencoded' };
  var postBody = querystring.stringify({
    'client_id': this.clientId,
    'client_secret': this.clientSecret,
    'grant_type': 'client_credentials'
  });

  var client = this;
  var req = apiRequest('POST', endpoint, headers, postBody, function(err, body) {
    if (err)
      return callback(err, false);

    var error = null;

    // if ADN supplied error string
    if (body.error) { error = new Error(body.error); }

    if (!error) {
      // check for access token
      if (body.access_token != null) {
        client.token = body.access_token;

      } else {
        error = new Error('Response did not include access token');
      }
    }

    return callback(error);
  });

  return req;
};



Client.prototype.isAuthenticated = function() {
  var result = false
  if (this.token) {
    if (this.appToken) {
      result = true;
    }
  }

  return result;
}




// Filters

Client.prototype.createFilter = function(filter, callback) {
  authedAPIRequest('POST', this.apiHost + '/filters', this.appToken, filter, callback);
}

Client.prototype.fetchFilterWithId = function(filter_id, callback) {
  authedAPIRequest('GET', this.apiHost + '/filters/' + filter_id, this.appToken, null, callback);
}

Client.prototype.fetchAllFilters = function(callback) {
  authedAPIRequest('GET', this.apiHost + '/filters', this.appToken, null, callback);
}

Client.prototype.deleteAllFilters = function(callback) {
  authedAPIRequest('DELETE', this.apiHost + '/filters', this.appToken, null, callback);
}

Client.prototype.fetchFilter = function(JSONFilter, callback) {
  var client = this;
  client.fetchAllFilters(function(err, body) {
    if (err)
      return callback(err);

    var filters = body.data;
    var fetchedFilter = null;

    for (var i = 0; i < filters.length; i++){
      var element = filters[i];
      if (element.name === JSONFilter.name) {
        fetchedFilter = element;
        break;
      }
    }

    if (fetchedFilter)
      return callback(null, fetchedFilter);

    console.log('Couldn\'t find filter with name: ' + JSONFilter.name + ', creating it');
    client.createFilter(JSONFilter, function(err, json) {
      if (err)
        return callback(err);

      return callback(null, json.data);
    });
  });
}


// JSON filter creation

Client.prototype.createFilterClause = function(obj_type, operator, field, value) {
  var val = value != null ? value : '$authorized_userids';
  return {
    'object_type': obj_type,
    'operator': operator,
    'field': field,
    'value': val
  }
};

Client.prototype.createJSONFilter = function(name, clauses, match_policy) {
  return {
    clauses: clauses,
    match_policy: match_policy,
    name: name
  };
}


// Convienence method for filter mentions, reposts, favourites, and follows

Client.prototype.generalNotificationFilterWithName = function(name) {
  var clauses = [
    this.createFilterClause('star', 'one_of', '/data/post/user/id'),
    this.createFilterClause('post', 'one_of', '/data/repost_of/user/id'),
    this.createFilterClause('post', 'one_of', '/data/entities/mentions/*/id'),
    this.createFilterClause('user_follow', 'one_of', '/data/follows_user/id')
  ];

  return this.createJSONFilter(name, clauses, 'include_any');
}




// Streams

Client.prototype.createStream = function(JSONStream, callback) {
  authedAPIRequest('POST', this.apiHost + '/streams', this.token, JSONStream, callback);
}

Client.prototype.fetchAllStreams = function(callback) {
  authedAPIRequest('GET', this.apiHost + '/streams', this.token, null, callback);
}

Client.prototype.fetchStream = function(JSONStream, callback) {
  var client = this;
  client.fetchAllStreams( function(err, json) {
    if (err)
      return callback(err);

    var streams = json.data
    var fetchedStream = null;

    // Find the stream with matching key
    for (var i = 0; i < streams.length; i++) {
      var element = streams[i];
      if (element.key === JSONStream.key) {
        fetchedStream = element;
        break;
      }
    }

    if (fetchedStream)
      return callback(null, fetchedStream);

    console.log('Couldn\'t find stream with key ' + JSONStream.key + ', creating it');
    client.createStream(JSONStream, function(err, json) {
      if (err)
        return callback(err);

      return callback(null, json.data);
    });
  });
}


// http://stackoverflow.com/questions/280634/endswith-in-javascript
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

String.prototype.containsSubstring = function(substring) {
  return this.indexOf(substring) != -1;
}


Client.prototype.monitorStream = function(stream, notificationBlock) {
  var options = {
    url: stream.endpoint,
    headers: {
      Authorization: 'Bearer ' + this.token,
      'X-ADN-Pretty-JSON': 1
    }
  }

  var chunk = '';
  var req = request(options, function(err, response, body) {
    response.setEncoding('utf8');
  });

  req.on('data', function(data) {
    chunk += data.toString('utf8');

    if (chunk.endsWith('\r\n')) {
      if (chunk === '\r\n') {
        // Keep alive

      } else {
        // Attempt JSON.parse();
        var parts = chunk.split('}\n{').join('}}__{{').split('}__{');

        for (var index in parts) {
          var part = parts[index];
          var json = null;

          try {
            json = JSON.parse(part);

          } catch(error) {
            console.log(error + '\nFAILED CHUNK: \n' + part);
          }

          if (json && notificationBlock) {
            notificationBlock(json.meta, json.data);
          }
        }
      }

      chunk = '';
    }
  });
}



// JSON stream creation

Client.prototype.createJSONStream = function(object_types, filterId, key) {
  return {
    object_types: object_types,
    type: 'long_poll',
    filter_id: filterId,
    key: key
  }
}


module.exports = Client;
