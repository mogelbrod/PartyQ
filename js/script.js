require([
  '$api/models',
  '$api/location#Location',
  '$api/search#Search',
  '$api/toplists#Toplist',
  '$views/buttons',
  '$views/list#List',
  '$views/image#Image'
  ], function(models, Location, Search, Toplist, buttons, List, Image) {

  // Get the currently-playing track
  models.player.load('track').done(updateCurrentTrack);
  // Update the DOM when the song changes
  models.player.addEventListener('change:track', updateCurrentTrack);


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
