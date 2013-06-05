exports.TwitterStream = function() {
  // http://robdodson.me/blog/2012/08/16/javascript-design-patterns-observer/
  // Returned interface
  var self = {};

  var consumerId = {
    token: "49442495-CCDhEnx7uRZIukkHlrzKFaQXWnq8yQnSuSYFMqQtY",
    tokenSecret: "QKCXBGzsgCHZAnM1dsmnAEKqha1STbICtM5yqoYe9sA",
    consumerKey : "6QbZ3XKblVamEQPfNzD9AQ",
    consumerSecret: "DsIqaxGHAO7FirdBLJtRtoG7RlkN5YzLVeVZ0iyrmfQ"
  };

  var streamURL = "https://stream.twitter.com/1.1/statuses/filter.json";

  // XHRequest object for active stream
  var xhr = null;
  var parsedLength = 0;

  //{{{ Event handling (Observer pattern)
  var subscribers = { any: [] };

  /**
   * Attaches a new event listener.
   */
  self.bind = function(type, fn, context) {
    type = type || 'any';
    fn = typeof fn === 'function' ? fn : context[fn];
    if (typeof subscribers[type] === "undefined")
      subscribers[type] = [];
    subscribers[type].push({ fn: fn, context: context || this });
  };

  /**
   * Removes an existing event listener.
   */
  self.unbind = function(type, fn, context) {
    visitSubscribers('unsubscribe', type, fn, context);
  };

  function visitSubscribers(action, type, arg, context) {
    var pubtype = type || 'any';
    var ofType = subscribers[pubtype];
    var max = ofType ? ofType.length : 0;

    for (var i = 0; i < max; i++) {
      // Call our observers, passing along arguments
      if (action === 'publish')
        ofType[i].fn.call(ofType[i].context, arg);
      else if (ofType[i].fn === arg && ofType[i].context === context)
        ofType.splice(i, 1);
    }
  }

  function trigger(type, publication) {
    visitSubscribers('publish', type, publication);
  }
  //}}}

  // Logging helper function.
  function log(string) {//{{{
    console.log("[TwitterStream] " + string);
  }//}}}

  function onChange() {//{{{
    var state = xhr.readyState;

    // Headers recieved
    if (state == 2 && xhr.status == 200) {
      log("connection opened");
      trigger('open');
    }
    // Data (partial) recieved
    else if (state == 3) {
      log("stream is now being recieved");

      // New data has arrived
      if (parsedLength < xhr.responseText.length) {
        var rawString = xhr.responseText.substring(parsedLength, xhr.responseText.length);
        // TODO: Verify that the parsed JSON is valid
        // If not, do not update parsedLength?
        var tweet = $.parseJSON(rawString);
        parsedLength = xhr.responseText.length;

        if (tweet.disconnect) {
          disconnect();
          return;
        }

        trigger('tweet', tweet);
      }
    }
    // Connection has been closed
    else if (state == 4) {
      log("connection closed");
      disconnect();
    }
  }//}}}

  self.connect = function(filter) {//{{{
    self.disconnect();

    if (!filter)
      filter = "#Spotify";

    var message = {
      action: streamURL,
      method: "GET",
      parameters: { track: filter }
    };

    OAuth.completeRequest(message, consumerId);
    OAuth.SignatureMethod.sign(message, consumerId);
    var url = streamURL + '?' + OAuth.formEncode(message.parameters);

    parsedLength = 0;
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = onChange;
    xhr.open('GET', url, true);
    xhr.send();

    trigger('connect', filter);
  }//}}}

  self.disconnect = function() {//{{{
    parsedLength = 0;
    if (xhr != null) {
      xhr.abort();
      xhr = null;
      trigger('disconnect');
    }
  }//}}}

  self.isConnected = function() {//{{{
    return xhr != null && xhr.readyState > 0 && xhr.readyState < 4; 
  }//}}}

  return self;
};
