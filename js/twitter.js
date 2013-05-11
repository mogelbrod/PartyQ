/* Twitter connection */

function buildQueueObject(tweet) {
  var object = new Object();
  object.user = tweet.user.screen_name;
  object.url = tweet.entities.urls[0].expanded_url;
  object.timestamp = tweet.created_at;
  console.log("Queue object created: ");
  console.log(object);
  //Send to the queue here.
}

function twitterConnection(hashtag) {
  var url = "https://stream.twitter.com/1.1/statuses/filter.json";
  var accessor = {
    token: "49442495-CCDhEnx7uRZIukkHlrzKFaQXWnq8yQnSuSYFMqQtY",
    tokenSecret: "QKCXBGzsgCHZAnM1dsmnAEKqha1STbICtM5yqoYe9sA",
    consumerKey : "6QbZ3XKblVamEQPfNzD9AQ",
    consumerSecret: "DsIqaxGHAO7FirdBLJtRtoG7RlkN5YzLVeVZ0iyrmfQ"
  };
  if (!hashtag) hashtag = "#funqueue";

  var message = {
    action: url,
    method: "GET",
    parameters: {"track":hashtag}
  };

  OAuth.completeRequest(message, accessor);
  OAuth.SignatureMethod.sign(message, accessor);
  url = url + '?' + OAuth.formEncode(message.parameters);

  var messageLen = 0;

  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);

  xhr.onreadystatechange = function() {
  if(xhr.readyState == 2 && xhr.status == 200) {
     // Connection is ok
     console.log("Twitter connection OK");
  } else if(xhr.readyState == 3){
    //Receiving stream
    console.log("Now receiveing Twitter stream");
    if (messageLen < xhr.responseText.length){
      var actualLength = xhr.responseText.length - messageLen;
      var string = (messageLen +"-"+ xhr.responseText.length +":"+xhr.responseText.substring(messageLen,xhr.responseText.length));
      if (actualLength > 2) {
        var tweet = $.parseJSON(xhr.responseText.substring(messageLen,xhr.responseText.length));
        buildQueueObject(tweet);
      }
    }
    messageLen = xhr.responseText.length;
    }else if(xhr.readyState == 4) {
      // Connection completed
      console.log("Twitter connection completed");
    }
  };
  xhr.send();
}