require([
  '$api/models',
  '$api/location#Location',
  '$api/search#Search',
  '$api/toplists#Toplist',
  '$views/buttons',
  '$views/list#List',
  '$views/image#Image'
  ], function(models, Location, Search, Toplist, buttons, List, Image) {

  // Enable clicking on spotify URIs
  $(function() {
    $('a.uri').click(function() {
      models.application.openURI($(this).attr('href'));
      return false;
    })
  });

  console.log("do some parsing");
  parseURL("spoti.fi/Jn1muJ");
  parseURL("http://open.spotify.com/track/0VnMmNfuTwlhJaxWIRwtb0");

  function parseURL(url) {
    uri = "";
    if (url.substring(0,8) == "spoti.fi" ) {//poti.fi") {
      console.log("its .fi");
      //is link of type: spoti.fy/Jn1muJ
      // We do not handle short urls.
      return null;
    } else {
      // Normal
      console.log("Normal");
      return "spotify:track:" + url.split("/").pop();
    }
  }

  priorityQueue = function () {//{{{
    var queue = new Array();
    var requestCallbacks = new Array();

    var self = {

      onRequest: function(callbackFunction) {
        requestCallbacks.push(callbackFunction);
      },

      callBack: function(track, requests, requesters) {
        for (var i = 0; i < requestCallbacks.length; i++) {
          requestCallbacks[i](track,requests,requesters);
        }
      },

      request: function(uri, requestData) {
        models.Track.fromURI(uri).load('name').done(function(track) {
          console.log(track.uri + ': ' + track.name.decodeForText());

          for (var i = 0; i < queue.length; i++) {
            if (track.uri == queue[i].track.uri) {
              queue[i].requesters.push(requestData);
              queue[i].requests = queue[i].requests + 1;
              var tmp = queue.splice(i,1)[0];
              self.insert(tmp);
              self.callBack(tmp.track,tmp.requests,tmp.requesters);
              return;
            }
          }

          var tmp = {
            track: track,
            requests: 1, // number of requests
            requesters: [ // length == requests
              requestData
            ]
          };

          queue.push(tmp);
          self.callBack(tmp.track,tmp.requests,tmp.requesters);
        });

      },

      pop: function(trackID) {
        if (trackID) {
          for (var i = 0; i < queue.length; i++) {
            if (queue[i].trackID == trackID) {
              return queue.splice(i,1)[0];
            }
          }
        } else {
          return queue.shift();
        }
      },

      all: function() {
        return queue;
      },

      insert: function(element) {
        if (queue.length == 0) {
          queue.push(element);
          return;
        }

        for (var i = 0; i < queue.length; i++) {
          if (element.requests > queue[i].requests) {
            queue.splice(i,0,element)
            break;
          }
          if (i == queue.length-1) {
            queue.push(element);
            break;
          }
        }
      },

      printQueue: function() {
        for (var i = 0; i < queue.length; i++) {
          console.log(i + ": " + queue[i].artists[0].name + " - " + queue[i].title 
            + " (trackID: " + queue[i].id +  "), " + queue[i].requests + " requests <br>");
        }
      }
    };
    return self;
  };//}}}

  //{{{ UI
    var $list = $('#list');
    var $rows = $list.find('tbody');
    var $emptyRow = $rows.find('tr.empty');
    var trackRowTemplate = Handlebars.compile($('#track-row-template').html());

    // Enable clicking on spotify URIs
    $(function() {
      $('a.uri').click(function() {
        models.application.openURI($(this).attr('href'));
        return false;
      })
    });

    /**
    * Simplifies track URI into a valid html ID.
    */
    function trackID(uri) {
      return uri.replace(/[^a-z0-9]/gi, '_');
    }

    function createTrackRow(data) {
      return $('<div>').html(trackRowTemplate(data)).contents();
    }

    function numRequests($row) {
      return parseInt($row.find('td.requests').text());
    }

    /**
    * Callback triggered when a track is requested.
    */
    function onRequest(track, requests, requesters) {//{{{
      var data = {
        id: trackID(track.uri),
        track: track,
        // uri: track.uri,
        // artists: [
          // { name: 'Unknown', uri: 'spotify:artist:518rTAIFPwQjLUSi4Pdzzn' }
        // ],
        // title: track,
        requests: requests,
        requesters: requesters
      };

      console.log("incoming: " + data.id);

      $emptyRow.hide();

      var $existing = $('#' + data.id);
      // Track exists in list, increment request count
      if ($existing.length) {
        // console.log(data.id + " exists already: " + $existing.attr('id'));
        // data.requests = numRequests($existing) + 1;

        // Find new position for track
        var $prevAll = $existing.prevAll();
        var i = $prevAll.length - 1;
        for (; i > 0; --i) {
          var prevNum = numRequests($prevAll.eq(i));
          if (prevNum > data.requests)
            break;
        }
        // Reposition track
        $existing.slideUp(function() {
          // console.log("updated request: "  + data.id);
          // console.log(vars);
          $existing.replaceWith(createTrackRow(data)).insertBefore($prevAll.eq(i));
        });
      }
      // New request (track does not exist in list)
      else {
        console.log("new request: " + data.id);
        console.log(data);
        createTrackRow(data).appendTo($rows);
      }
    }//}}}

    /**
    * Callback triggered when a track is played (and therefore removed from the list).
    */
    function onPlay(track) {//{{{
      var $row = $('#' + trackID(track));
      $row.slideUp(function() {
        $row.remove();
      });
    }//}}}

    $rows.on('dblclick', 'tr', function(event) {
      var $row = $(this);
      $row.remove();
      event.preventDefault();
      return false;
    })
    //}}}

  var queue = priorityQueue();

  queue.request("spotify:track:2Foc5Q5nqNiosCNqttzHof",{name: "lujon", url: "http://google.com", timestamp: new Date()});
  queue.request("spotify:track:2Foc5Q5nqNiosCNqttzHof",{name: "mogel", url: "http://google.com", timestamp: new Date()});

  queue.printQueue();
  queue.onRequest(onRequest);
  // twitterConnection('#funq', queue.request);

  //{{{ Playlist / queue handling
    var tmpPlaylist  = null;
    var USE_PLAYLIST = true;
    
    // Triggers changeTrack() when track is changed. Logic!
    models.player.addEventListener('change:track', changeEventHandler);

    createPlaylist();

    // Called when track is changed.
    function changeEventHandler() {
      if(USE_PLAYLIST)
        addTrackToPlaylist();
      else
        changeTrackNow();
    }

    /**
    * Returns the uri for next song, 
    * if null the queue is used as normal
    * TODO: This should be changed to use our queue.
    */
    function __getNextSongURI() {
      uri = queue.pop().track.uri;
      return uri;
    }

    /*
      Return the next trackobject to be played.
    */
    function getNextTrack(callback) {
      uri = __getNextSongURI();
      if (uri != null) {
        //console.log("Setting next song: " + uri);
        models.Track.fromURI(uri).load('name','uri').done(function(track) {
          callback(track);
        });
      }
    }

    /*
      Fetches uri and plays that track, if uri is not null.
    */
    function changeTrackNow() {
      console.log("ChangeTrack");
      getNextTrack(function(track) {
        console.log("changing song now: " + uri);
        displayTrack(track);
        playSong(track);
      });
    }

    /*
    * Initailly set up a playlist
    */
    function createPlaylist() {
      console.log("Create custom playlist");
      p = models.Playlist.createTemporary("CustomList"); //TODO change name
      p.done(function(pList){
        console.log("done. The playlist is ours");
        pList.load('tracks').done(function(loadedPlaylist){
          console.log("loaded");
          tmpPlaylist = loadedPlaylist;
        });
      });
    }

    /*
      Adds next track to our playlist.
    */
    function addTrackToPlaylist() {    
      console.log("playlist " + tmpPlaylist.name);
      console.log("loaded");
      getNextTrack(function(track) {
        console.log("got track: " + track);
        console.log("loaded a track");
        console.log(track);
        tmpPlaylist.tracks.add(track);
        // set the playlist as playing now
        models.player.playContext(tmpPlaylist);
        console.log("context set");
      });
    }
    
    /*
      Plays the song imidiatly.
    */
    function playSong(track) {
      models.player.playTrack(track);
    }

    function displayTrack(track) {
      console.log(track.name);
    }
    //}}}
});
