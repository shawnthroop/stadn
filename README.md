# PADN

A client side script for monitoring an App.net App Stream, written in node.
  
Creating a new client is easy if you enter your `client_id`, `client_secret` and `app_token` into the `.config` file. Otherwise, pass them in as arguments when creating a new instance. Keep in mind the 'app_token' is generated from your app's developer page and is not a user token.

``` javascript
var PADN = require('./PADN');
var client = new PADN('client_id', 'client_secret', 'app_token');
```

## Authorize

Creat a new client and authorize it.

``` javascript
  var client = new PADN();
  client.authorize(function(err) {
    if (err)
      return console.error(err);
      
    var authorized = client.isAuthorized(); // true
  });
```

## Fetching a stream

You need a `filter_id` to get a specific subset of your App Stream. Fetch the a filter and then a stream. Both `fetchFilter()` and `fetchStream()` search for a pre-existing filter with the same name before creating it. If an object already exist it is returned. 

``` javascript
var clauses = [client.createFilterClause('post', 'one_of', '/data/entities/mentions/*/id')];
var JSONFilter = client.createJSONFilter('mentions', clauses, 'include_any');

client.fetchFilter(JSONFilter, function(err, filter) {
  if (err)
    return console.error(err);
  
  var JSONStream = client.createJSONStream(['post','star','user_follow'], filter.id, JSONStreamKey);
  client.createStream(JSONStream, function(err, stream) {
    if (err)
      return console.error(err);
    
    var streamEndpoint = stream.endpoint; // https://stream-channel.app.net/channel/...
  });
});
```


