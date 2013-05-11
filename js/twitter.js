/* Twitter connection */

function buildSignature() {
  var auth = new Object();
  auth.oauth_consumer_key = "6QbZ3XKblVamEQPfNzD9AQ";
  auth.oauth_nonce = Math.random().toString(36).substr(2,16);
  auth.oauth_signature_method = "HMAC-SHA1";
  auth.oauth_timestamp = Math.floor(new Date().getTime()/1000);
  auth.oauth_token = "49442495-CCDhEnx7uRZIukkHlrzKFaQXWnq8yQnSuSYFMqQtY";
  auth.oauth_version = "1.0";
//  var encodedString = 
  console.log(escape(JSON.stringify(auth)));
}

function jodeli() {
  var url = "https://stream.twitter.com/1.1/statuses/filter.json";
  var accessor = {
    token: "49442495-CCDhEnx7uRZIukkHlrzKFaQXWnq8yQnSuSYFMqQtY",
    tokenSecret: "QKCXBGzsgCHZAnM1dsmnAEKqha1STbICtM5yqoYe9sA",
    consumerKey : "6QbZ3XKblVamEQPfNzD9AQ",
    consumerSecret: "DsIqaxGHAO7FirdBLJtRtoG7RlkN5YzLVeVZ0iyrmfQ"
  };

  var message = {
    action: url,
    method: "GET",
    parameters: {"track":"#funqueue"}
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
  } else if(xhr.readyState == 3){ 
  //Receiving stream
    if (messageLen < xhr.responseText.length){
      console.log(messageLen +"-"+ xhr.responseText.length +":"+xhr.responseText.substring(messageLen,xhr.responseText.length));
    }
    messageLen = xhr.responseText.length;
    }else if(xhr.readyState == 4) {}    
    // Connection completed
  };  
  xhr.send();
}