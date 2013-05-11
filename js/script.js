'use strict';

var sp = getSpotifyApi();
var $list = $('#list');
var $rows = $list.find('tbody');

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

requestHandler(track, requestData) {
}

(function () {
  console.log('init()');

  sp.trackPlayer.addEventListener('playerStateChanged', function (event) {
  });
})();
