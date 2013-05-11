require([
  '$api/models',
  '$api/location#Location',
  '$api/search#Search',
  '$api/toplists#Toplist',
  '$views/buttons',
  '$views/list#List',
  '$views/image#Image'
  ], function(models, Location, Search, Toplist, buttons, List, Image, Link) {

  // Enable clicking on spotify URIs
  $(function() {
    $('a.uri').click(function() {
      models.application.openURI($(this).attr('href'));
      return false;
    })
  });

  function parseURL(url) {
    return "spotify:track:" + url.split("/").pop();
  }

  priorityQueue = function () {
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

      request: function(url, requestData) {
        var uri = models.Link.fromURL(url).uri;
        var track = models.Track.fromURI(uri);

        for (var i = 0; i < queue.length; i++) {
          if (track.uri == queue[i].track.uri) {
            queue[i].requesters.push(requestData);
            queue[i].requests = queue[i].requests + 1;
            var tmp = queue.splice(i,1)[0];
            this.insert(tmp);
            callBack(tmp.track,tmp.requests,tmp.requesters);
            return;
          }
        }

        var requestRow = {
        track: track,
        requests: 1, // number of requests
        requesters: [ // length == requests
        requestData
        ]
        };

        queue.push(requestRow);
        callBack(tmp.track,tmp.requests,tmp.requesters);
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
          document.write(i + ": " + queue[i].artists[0].name + " - " + queue[i].title 
            + " (trackID: " + queue[i].id +  "), " + queue[i].requests + " requests <br>");
        }
      }
    };
    return self;
  };

  var tmpPlaylist  = null;
  var USE_PLAYLIST = true;
  var queue = priorityQueue();

  queue.request("spotify:track:2Foc5Q5nqNiosCNqttzHof",{name: "lujon", url: "http", timestamp: new Date()});
  
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

  /*
  function updateCurrentTrack(){
      var currentHTML = document.getElementById('current-track');
      if (models.player.track == null) {
          console.log('No track currently playing');
      } else {
          var artists = models.player.track.artists;
          var artists_array = [];
          for(i=0;i<artists.length;i++) {
              artists_array.push(artists[i].name);
          }
          console.log('Now playing: ' + artists_array.join(', '));
          console.log(models.player.track.name);
      }
    }

  /*    
  var $list = $('#list');
  var $rows = $list.find('tbody');
  
  function playTracks(tracks, index) {
    var pl = new models.Playlist();
    pl.add("spotify:track:6JEK0CvvjDjjMUBFoXShNZ");
    
    models.player.play(pl.uri, pl.uri, 0);
  }

  playTracks("", 0);

  var tracksURIs = [
    "spotify:track:4yJmwG2C1SDgcBbV50xI91",
    "spotify:track:4uwaTTrDykHbWFBb8RGYWI",
    "spotify:track:2Foc5Q5nqNiosCNqttzHof"
  ];

  for (var i = 0; i < tracksURIs.length; i++) {
    Track.fromURI(tracksURIs[i], function(track) {
      var artists = track.artists ? track.artists.join(', ') : 'Unknown';
      var requestedBy = 'Anonymous';
      $rows.append("<tr><td>"+artists+"</td><td>"+track.name+"</td><td>"+1+"</td><td>"+requestedBy+"</td></tr>");
    });
  };

  function requestHandler(track, requestData) {
  };*/



});
