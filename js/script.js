require([
  '$api/models',
  '$api/location#Location',
  '$api/search#Search',
  '$api/toplists#Toplist',
  '$views/buttons',
  '$views/list#List',
  '$views/image#Image'
  ], function(models, Location, Search, Toplist, buttons, List, Image) {

  /* 
   Triggers changeTrack() when track is changed. Logic!
  */
  models.player.addEventListener('change:track', changeTrack);

  /**
   * called on change:track.
   * should return the uri for next song, 
   * if null the queue is used as normal
   */
  function getNextSongURI() {
    uri = $("#nextTrack").val();
    return uri;
  }

  /*
    Fetches uri and plays that track, if uri is not null.
  */
  function changeTrack() {
    console.log("ChangeTrack");
    uri = getNextSongURI();

    if (uri == null) {
      // No new song
      console.log("Dont change song. Song is null");
    } else {
      console.log("Setting next song: " + uri);
      track = models.Track.fromURI(uri).load('name').done(
        function(track) {
          displayTrack(track);
          playSong(track);
      });
    }

    //updateCurrentTrack();
  }

  
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
