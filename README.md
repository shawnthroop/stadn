# PADN

A client side script for monitoring an App.net App Stream, written in node.

## Initialize

Creating a new client is easy if you enter your `client_id`, `client_secret` and `app_token` into the `.config` file. Otherwise, pass them in as arguments when creating a new instance. Keep in mind the `app_token` is generated from your app's developer page and is not a user token.

``` javascript
var PADN = require('./PADN');
var client = new PADN('client_id', 'client_secret', 'app_token');
```

## Authorize

Create a new client and authorize it.

``` javascript
  var client = new PADN();
  client.authorize(function(err) {
    if (err)
      return console.error(err);

    var authorized = client.isAuthorized(); // true
  });
```

## Fetching a stream

You need a `filter_id` to get a specific subset of your App Stream. Fetch a filter and then a stream, both `fetchFilter()` and `fetchStream()` search for a pre-existing filter with the same name/key before creating it. If an filter or stream already exist it is returned.

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

## Monitoring an endpoint

Once you have a stream and an authorized client, you can monitor for notifications by passing in a block:

``` javascript
var client = // Authorized client
var stream = // Stream object returned in the callback from fetchStream. Not a JSONStream.

// the returned object is a json object conforming to examples: https://developers.app.net/reference/resources/app-stream/#sample-stream-objects
client.monitorStream(stream, function(json) {
  var meta = json.meta;
  if (meta.type) {
    // handle JSON object with type 'post'
  }
});
```
