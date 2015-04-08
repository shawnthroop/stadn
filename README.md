# STADN

A node.js script that can fetch and monitor a filtered App.net App Stream

## Initialize

Create a new configuration file following the example in `example-config.js` and enter you `client_id`, `client_secret` and `app_token`. Then when creating a client, specify the path of the config file. Keep in mind the `app_token` you provide must be generated from your app's developer page. It cannot be a user token.

``` javascript
var STADN = require('./STADN');
var client = STADN.Client.create('config');
```

## Authorize

Create a new client and authorize it.

``` javascript
var client = STADN.Client.create('config');
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

Once you have a stream and an authorized client, you can monitor for notifications by passing in a block:

``` javascript
var client = // Authorized client
var stream = // Stream object returned in the callback from fetchStream. Not a JSONStream.

client.monitorStream(stream, function(meta, data) {
    // handle chunk of stream data, for example:
    if (meta.type === 'post') {
      var post = STADN.Post.createWithData(data);
      console.log(post);
    }
});
```

*Note: `meta` and `data` are json objects corresponding to parts of the stream objects outlined here: https://developers.app.net/reference/resources/app-stream/#sample-stream-objects*
