$(function() {
  var $list = $('#list');
  var $rows = $list.find('tbody');
  var $emptyRow = $rows.find('tr.empty');
  var trackRowTemplate = Handlebars.compile($('#track-row-template').html());

  var tracksURIs = [
    "spotify:track:4yJmwG2C1SDgcBbV50xI91",
    "spotify:track:4uwaTTrDykHbWFBb8RGYWI",
    "spotify:track:2Foc5Q5nqNiosCNqttzHof",
    "spotify:track:4yJmwG2C1SDgcBbV50xI91"
  ];

  function trackID(uri) {
    return uri.replace(/^spotify:track:/, '');
  }

  for (var i = 0; i < tracksURIs.length; i++) {
    var t = tracksURIs[i];
    onRequest(t, null);
  };

  function onRequest(track, requestData) {
    var data = {
      id: trackID(track),
      uri: track,
      artists: 'Unknown',
      title: track,
      requests: 1,
      requestedBy: 'Anonymous'
    };
    $emptyRow.hide();

    var $existing = $('#'+data.id);
    // Track exists in list, increment request count
    if ($existing.length) {
      var $td = $existing.find('td.requests');
      var num = parseInt($td.text());
      num += 1;
      $td.text(num);
    }
    // New request (track does not exist in list)
    else {
      $rows.append(trackRowTemplate(data));
    }
  }

  $rows.on('dblclick', 'tr', function(event) {
    var $row = $(this);
    console.log($row.attr('id'));
    $row.remove();
    event.preventDefault();
    return false;
  })
});
