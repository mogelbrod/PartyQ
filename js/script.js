'use strict';
window.onload = function() {
  var sp = getSpotifyApi();
  var models = sp.require('$api/models');

  function playTracks(tracks, index) {
    var pl = new models.Playlist();
    pl.add("spotify:track:6JEK0CvvjDjjMUBFoXShNZ");
    
    models.player.play(pl.uri, pl.uri, 0);
  }

  playTracks("", 0);

};
