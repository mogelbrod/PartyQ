$(function() {
  var $list = $('#list');
  var $rows = $list.find('tbody');
  var $emptyRow = $rows.find('tr.empty');
  var trackRowTemplate = Handlebars.compile($('#track-row-template').html());

  var tracksURIs = [
    "top",
    "top",
    "ok",
    "meh",
    "ok",
    "ok",
    "lol",
    "lol",
    "top"
  ];

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

    console.log("incoming: " + vars.id);

    $emptyRow.hide();

    var $existing = $('#' + vars.id);
    // Track exists in list, increment request count
    if ($existing.length) {
      // console.log(vars.id + " exists already: " + $existing.attr('id'));
      // vars.requests = numRequests($existing) + 1;

      // Find new position for track
      var $prevAll = $existing.prevAll();
      var i = $prevAll.length - 1;
      for (; i > 0; --i) {
        var prevNum = numRequests($prevAll.eq(i));
        if (prevNum > vars.requests)
          break;
      }
      // Reposition track
      $existing.slideUp(function() {
        // console.log("updated request: "  + vars.id);
        // console.log(vars);
        $existing.replaceWith(createTrackRow(vars)).insertBefore($prevAll.eq(i));
      });
    }
    // New request (track does not exist in list)
    else {
      console.log("new request: " + vars.id);
      console.log(vars);
      createTrackRow(vars).appendTo($rows);
    }
  }

  $rows.on('dblclick', 'tr', function(event) {
    var $row = $(this);
    console.log($row.data('data').requests);
    $row.remove();
    event.preventDefault();
    return false;
  })
});
