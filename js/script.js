require([
    '$api/models',
    '$api/location#Location',
    '$api/search#Search',
    '$api/toplists#Toplist',
    '$views/buttons',
    '$views/list#List',
    '$views/image#Image'
    ], function(models, Location, Search, Toplist, buttons, List, Image) {

      console.log("do some parsing");
      parseURL("http://spoti.fi/Jn1muJ");
      parseURL("http://open.spotify.com/track/0VnMmNfuTwlhJaxWIRwtb0");

      function parseURL(url) {
        uri = "";
        if (url.substring(0,15) == "http://spoti.fi" ) {//poti.fi") {
          console.log("its .fi");
          //is link of type: spoti.fy/Jn1muJ
          // We do not handle short urls.
          $.ajax({
            type: "GET",
            url: url,
            success: function(data) {
              console.log("META")
              $(data).find('meta[property="og:url"]').each(function() {
                console.log($(this).text());
                console.log(a);
              });
            }
          });
            
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
        var playCallbacks = [];

        var self = {

          onRequest: function(callbackFunction) {
            requestCallbacks.push(callbackFunction);
          },

          onPlay: function(callbackFunction) {
            playCallbacks.push(callbackFunction);
          },


          requestCallback: function(track, requests, requesters) {
            for (var i = 0; i < requestCallbacks.length; i++) {
              requestCallbacks[i](track,requests,requesters);
            }
          },

          playCallback: function(track) {
            for (var i = 0; i < playCallbacks.length; i++) {
              playCallbacks[i](track);
            }
          },

          handleTwitterObject: function (object) {
            var uri = 0;
            uri = parseURL(object.url);
            if (!uri) {
              console.log("failed to handle twitter object");
            } else {
              self.request(uri, object);
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

          pop: function(uri) {
            console.log("pop called: " + uri);

            if (queue.length == 0) {
              return null;
            }

            if (uri) {
              for (var i = 0; i < queue.length; i++) {
                if (queue[i].track.uri == uri) {
                  var row = queue.splice(i,1)[0];
                  self.playCallback(row.track);
                  return row;
                }
              }
            } else {
              var row = queue.shift();
              self.playCallback(row.track);
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
              console.log(i + ": " + queue[i].track.uri + " / " + queue[i].requests + " requests");
            }
          }
        };
        return self;
      };//}}}

      var queue = priorityQueue();

      //{{{ UI
      $(function() {
        // Enable clicking on spotify URIs
        $('a.uri').click(function() {
          models.application.openURI($(this).attr('href'));
          return false;
        });

      var $list = $('#list');
      var $rows = $list.find('tbody');
      var $emptyRow = $rows.find('tr.empty');
      var trackRowTemplate = Handlebars.compile($('#track-row-template').html());

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

      function redraw() {
        $emptyRow.hide();
        $rows.children().remove();

        var all = queue.all();
        for (var i = 0; i < all.length; i++) {
          var data = all[i];
          data.id = trackID(data.track.uri);
          createTrackRow(data).appendTo($rows);
        };

        if (all.length < 1)
          $emptyRow.show();
      }

      /**
       * Callback triggered when a track is requested.
       */
      function onRequest(track, requests, requesters) {//{{{
        redraw();
/*
 *         console.log("INCOMING REQUEST:");
 *         console.log(track);
 *         var data = {
 *           id: trackID(track.uri),
 *           track: track,
 *           // uri: track.uri,
 *           // artists: [
 *           // { name: 'Unknown', uri: 'spotify:artist:518rTAIFPwQjLUSi4Pdzzn' }
 *           // ],
 *           // title: track,
 *           requests: requests,
 *           requesters: requesters
 *         };
 *         console.log(data);
 * 
 *         $emptyRow.hide();
 * 
 *         var $existing = $('#' + data.id);
 *         // Track exists in list, increment request count
 *         if ($existing.length) {
 *           // console.log(data.id + " exists already: " + $existing.attr('id'));
 *           // data.requests = numRequests($existing) + 1;
 * 
 *           // Find new position for track
 *           var $prevAll = $existing.prevAll();
 *           var i = $prevAll.length - 1;
 *           for (; i > 0; --i) {
 *             var prevNum = numRequests($prevAll.eq(i));
 *             if (prevNum > data.requests)
 *               break;
 *           }
 *           // Reposition track
 *           $existing.slideUp(function() {
 *             // console.log("updated request: "  + data.id);
 *             // console.log(vars);
 *             $existing.replaceWith(createTrackRow(data)).insertBefore($prevAll.eq(i));
 *           });
 *         }
 *         // New request (track does not exist in list)
 *         else {
 *           console.log("new request: " + data.id);
 *           console.log(data);
 *           createTrackRow(data).appendTo($rows);
 *         }
 */
      }//}}}

      /**
       * Callback triggered when a track is played (and therefore removed from the list).
       */
      function onPlay(track) {//{{{
        redraw();
      }//}}}

      // Force play song when doubleclicked
      $rows.on('dblclick', 'tr', function(event) {//{{{
        var $row = $(this);
        $row.remove();
        var uri = $row.data('uri');
        console.log("manually playing " + uri);
        playTrack(queue.pop(uri));
        event.preventDefault();
        return false;
      });//}}}

      // Enable clicking on spotify URIs
      $('a.uri').click(function() {//{{{
        models.application.openURI($(this).attr('href'));
        return false;
      });//}}}

      queue.onRequest(onRequest);
      queue.onPlay(onPlay);

      });
      //}}}

      uris = [
      "spotify:track:3KKaGvEv3xkQpRAUMX4e0l",
      "spotify:track:2voSfpVGeRWNQjIsvUXsDH",
      "spotify:track:0VnMmNfuTwlhJaxWIRwtb0",
      "spotify:track:2Foc5Q5nqNiosCNqttzHof"]

      mogel = {name: "mogel", url: "http://google.com", timestamp: new Date()};
      ludo  = {name: "ludo", url: "http://google.com", timestamp: new Date()}

      function massTest() {
        timedRequest(uris[1], mogel, 800, true);
        timedRequest(uris[2], ludo, 1400, true);
        timedRequest(uris[3], mogel, 2000, true);
        timedRequest(uris[0], ludo, 2400, true);
      }

      function smallTest() {
        timedRequest(uris[0], mogel, 8000, false);
        timedRequest(uris[1], ludo, 1400, false);
        timedRequest(uris[2], mogel, 2000, false);
        timedRequest(uris[3], ludo, 2400, false);
        timedRequest(uris[3], ludo, 3400, false);
        timedRequest(uris[3], ludo, 2600, false);
        timedRequest(uris[3], ludo, 2700, false);

        setTimeout(function() {
          console.log("PRINT QUE!");
          queue.printQueue();  
        },10000);
        
      }      

      //massTest();
      smallTest();
      
      function timedRequest(uri, reqData, delay, repeat) {
        if (repeat) {
          setInterval(function() {
            queue.request(uri, reqData);  
          },
          delay)  
        } else {
          setTimeout(function() {
            queue.request(uri, reqData);
          }, delay);
        }
      }

      queue.printQueue();
      twitterConnection('#funqueue', queue.handleTwitterObject);

      //{{{ Playlist / queue handling
      // Triggers changeTrack() when track is changed. Logic!
      models.player.addEventListener('change:track', changeEventHandler);

      // Called when track is changed.
      function changeEventHandler() {
        console.log("changeEventHandler");
        playTrack(queue.pop());
      }

      function playTrack(req) {
        if (req == null) {
          console.log("playTrack: nothing to play (null)");
        } else {
          console.log("playTrack: next up: " + req.track.uri);
          req.track.load('name','uri').done(function(track) {
            console.log("changing song now: " + track.uri);
            models.player.removeEventListener('change:track', changeEventHandler);
            models.player.playTrack(track);
            setTimeout(function() {
              models.player.addEventListener('change:track', changeEventHandler);
            }, 100);
          });
        }
      }

      //}}}
    });
