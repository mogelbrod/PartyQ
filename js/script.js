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
        var queue = [];
        var requestCallbacks = [];
        var removeCallbacks = [];

        var self = {

          onRequest: function(callbackFunction) {
            requestCallbacks.push(callbackFunction);
          },

          onPlay: function(callbackFunction) {
            removeCallbacks.push(callbackFunction);
          },


          requestCallback: function(track, requests, requesters) {
            for (var i = 0; i < requestCallbacks.length; i++) {
              requestCallbacks[i](track,requests,requesters);
            }
          },

          removeCallback: function(track) {
            for (var i = 0; i < removeCallbacks.length; i++) {
              removeCallbacks[i](track);
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
                  self.requestCallback(tmp.track,tmp.requests,tmp.requesters);
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
              self.requestCallback(tmp.track,tmp.requests,tmp.requesters);
            });

          },

          pop: function(trackID) {
            console.log("pop called");

            if (queue.length == 0) {
              return null;
            }

            if (trackID) {
              for (var i = 0; i < queue.length; i++) {
                if (queue[i].trackID == trackID) {
                  var row = queue.splice(i,1)[0];
                  self.removeCallback(row.track);
                  return row;
                }
              }
            } else {
              var row = queue.shift();
              self.removeCallback(row.track);
              return row;
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
        return String(uri).replace(/[^a-z0-9]/gi, '_');
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
        console.log("INCOMING REQUEST:");
        console.log(track);
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
        console.log(data);

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
      queue.onPlay(onPlay);
      // twitterConnection('#funq', queue.request);

      //{{{ Playlist / queue handling
      var tmpPlaylist  = null;
      var USE_PLAYLIST = false;

      // Triggers changeTrack() when track is changed. Logic!
      models.player.addEventListener('change:track', changeEventHandler);

      createPlaylist();

      // Called when track is changed.
      function changeEventHandler() {
        console.log("changeEventHandler");
        if(USE_PLAYLIST)
          addTrackToPlaylist();
        else
          changeTrackNow();
      }

      /*
         Return the next trackobject to be played.
         */
      function getNextTrack(callback) {
        console.log("Retrieving next track");
        var req = queue.pop();
        console.log(req);
        if (req != null) {
          console.log("left in queue: " + req.track.uri);
          req.track.load('name','uri').done(function(track) {
            callback(track);
          });
        } else {
          console.log("nothing left in queue");
        }
        //console.log("Setting next song: " + uri);
      }

      /*
         Fetches uri and plays that track, if uri is not null.
         */
      function changeTrackNow() {
        console.log("ChangeTrack");
        getNextTrack(function(track) {
          console.log("changing song now: " + track.uri);
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
        models.player.removeEventListener('change:track', changeEventHandler);
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
          models.player.addEventListener('change:track', changeEventHandler);
        });
      }

      /*
         Plays the song imidiatly.
         */
      function playSong(track) {
        models.player.removeEventListener('change:track', changeEventHandler);
        models.player.playTrack(track);
        models.player.addEventListener('change:track', changeEventHandler);
      }

      function displayTrack(track) {
        console.log(track.name);
      }
      //}}}
    });
