# stadn.js

A node.js script that can fetch and monitor a filtered App.net App Stream

## Initialize

Two objects can be created from the base `stadn` object: a client object and an object for constructing model objects. For convenience, supply your `client_id`, `client_secret` and `app_token` in a configuration file. An example file is provided. Then when creating your client, pass in the path to this configuration file.

``` javascript
var adn = require('stadn');
var client = adn.Client('./config');
```

Or if you prefer not to use a configuration file, use `initialize()`.

``` javascript
var client = adn.Client();
client.initialize('CLIENT_ID', 'CLIENT_SECRET', 'APP_TOKEN');
```

Creating a model object constructor is easy.

``` javascript
var model = adn.Model();
```


## Authorize

Create a new client and authorize it. You must supply a client ID and secret before calling 'authorize()' or an error will be returned in the callback.

``` javascript
var client = adn.Client('./config');
client.authorize(function(err) {
  if (err)
    return console.error(err);

  var authorized = client.isAuthorized(); // true
});
```


## Fetching a stream

You need a `filter_id` to get a specific subset of your App Stream. Fetch a filter and then a stream, both `fetchFilter()` and `fetchStream()` search for a pre-existing filter with the same name/key before creating it. If a filter or stream already exist it is returned.

``` javascript
var clauses = [client.createFilterClause('post', 'one_of', '/data/entities/mentions/*/id')];
var JSONFilter = client.createJSONFilter('mentions', clauses, 'include_any');

client.fetchFilter(JSONFilter, function(err, filter) {
  if (err)
    return console.error(err);

  var JSONStream = client.createJSONStream(['post','star','user_follow'], filter.id, JSONStreamKey);
  client.fetchStream(JSONStream, function(err, stream) {
    if (err)
      return console.error(err);

    var streamEndpoint = stream.endpoint; // https://stream-channel.app.net/channel/...
  });
});
```


## Monitoring an endpoint

Once you have a stream and an authorized client, you can monitor for notifications by passing in a block.

``` javascript
var model = adn.Model();

var client = // Pre-authorized client object
var stream = // Stream object returned in the callback from fetchStream. Not a JSONStream.

client.monitorStream(stream, function(meta, data) {
    // handle chunk of stream data, for example:
    if (meta.type === 'post') {
      var post = model.postWithData.(data);
      console.log(post);
    }
});
```

*Note: `meta` and `data` are json objects corresponding to parts of the stream objects outlined here: https://developers.app.net/reference/resources/app-stream/#sample-stream-objects*
