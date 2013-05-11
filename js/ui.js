$(function() {
  var $list = $('#list');
  var $rows = $list.find('tbody');
  var $emptyRow = $rows.find('tr.empty');
  var trackRowTemplate = Handlebars.compile($('#track-row-template').html());

  var tracksURIs = [
    "spotify:track:4yJmwG2C1SDgcBbV50xI91",
    "spotify:track:4yJmwG2C1SDgcBbV50xI91",
    "spotify:track:4uwaTTrDykHbWFBb8RGYWI",
    "spotify:track:2Foc5Q5nqNiosCNqttzHof",
    "spotify:track:4uwaTTrDykHbWFBb8RGYWI",
    "spotify:track:4uwaTTrDykHbWFBb8RGYWI",
    "spotify:track:4yJmwG2C1SDgcBbV50xI91",
    "spotify:track:4yJmwG2C1SDgcBbV50xI91",
    "spotify:track:4yJmwG2C1SDgcBbV50xI91"
  ];

  /**
  * Simplifies track URI into a valid html ID.
  */
  function trackID(uri) {
    return uri.replace(/^spotify:track:/, '');
  }

  function createTrackRow(data) {
    var $row = $('<div>').html(trackRowTemplate(data)).contents();
    $row.data('requests', data.requests);
    $row.data('uri', data.uri);
    return $row;
  }

  for (var i = 0; i < tracksURIs.length; i++) {
    var t = tracksURIs[i];
    onRequest(t);
  };

  /**
   * Remote request callback function
   */
  function onRequest(track, data, tweetData) {
    var vars = {
      id: trackID(track),
      uri: track,
      artists: [
        { name: 'Unknown', uri: 'spotify:artist:518rTAIFPwQjLUSi4Pdzzn' }
      ],
      title: track,
      requests: 1,
      requesters: [
        { user: 'Anonymous' }
      ]
    };

    $emptyRow.hide();

    var $existing = $('#' + vars.id);
    // Track exists in list, increment request count
    if ($existing.length) {
      vars.requests = $existing.data('requests') + 1;
      console.log(vars);

      // Find new position for track
      var $prevAll = $existing.prevAll();
      var i = $prevAll.length - 1;
      for (; i > 0; --i) {
        var prevNum = parseInt($prevAll.eq(i).data('requests'));
        if (prevNum > vars.requests)
          break;
      }
      // Reposition track
      $existing.slideUp(function() {
        $(this).remove();
        createTrackRow(vars).insertBefore($prevAll.eq(i));
      });
    }
    // New request (track does not exist in list)
    else {
      createTrackRow(vars).appendTo($rows);
    }
  }

  $rows.on('dblclick', 'tr', function(event) {
    var $row = $(this);
    console.log($row.data('uri'));
    $row.remove();
    event.preventDefault();
    return false;
  })
});
