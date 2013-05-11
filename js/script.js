require([
  '$api/models',
  '$api/location#Location',
  '$api/search#Search',
  '$api/toplists#Toplist',
  '$views/buttons',
  '$views/list#List',
  '$views/image#Image'
  ], function(models, Location, Search, Toplist, buttons, List, Image) {

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
    uri = $("#nextTrack").val();
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
