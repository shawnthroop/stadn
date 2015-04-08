// A push notification server, node.js style

var PADN = require('./PADN.js');

var client = new PADN.Client;
var JSONFilter = client.generalNotificationFilterWithName('mention_repost_star_follow');
var JSONStreamKey = 'general_notifications_stream';


client.authenticate( function(err) {
  if (err)
    return console.error(err);


  // Authenticated, now get filters
  console.log('Fetching filter object');
  client.fetchFilter(JSONFilter, function(err, filter) {
    if (err)
      return console.error(err);

    // Fetched and/or created filter, now create stream
    console.log('Fetching stream object');
    var JSONStream = client.createJSONStream(['post','star','user_follow'], filter.id, JSONStreamKey);
    client.fetchStream(JSONStream, function(err, stream) {
      if (err)
        return console.error(err);


      var monitorBlock = function(meta, data) {
        if (meta.type === 'post') {
          var mentionsString = '';
          var mentions = data.entities.mentions;
          for (var i = 0; i < mentions.length; i++) {
            var mention = mentions[i].name;
            mentionsString += '@' + mention;
          }

          console.log('User: @' + data.user.username + ' posted: ' + data.text + '\nMentions: ' + mentionsString + '\n---');
        }
      };


      console.log('Starting to monitor stream');
      client.monitorStream(stream, monitorBlock);
    });
  });
});
