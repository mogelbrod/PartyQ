require(['$api/models'], function(models) {

  // Show share popup
  var shareHTML = document.getElementById('sharePopup');
  var shareURI = 'spotify:track:249E7AgSyA4vhtXNEjQYb5';
  var rect = shareHTML.getBoundingClientRect();
  shareHTML.addEventListener('click', showSharePopup);

  function showSharePopup(){
    models.client.showShareUI(shareURI, 'Check out my jam',
      {x:((rect.width/2) + rect.left), y:rect.top});
  }

});

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

  /**
  * Simplifies track URI into a valid html ID.
  */
  function trackID(uri) {
    return uri.replace(/^spotify:track:/, '');
  }

  for (var i = 0; i < tracksURIs.length; i++) {
    var t = tracksURIs[i];
    onRequest(t, null);
  };

  /**
   * Remote request callback function
   */
  function onRequest(track, requestData) {
    var data = {
      id: trackID(track),
      uri: track,
      artists: [{ name: 'Unknown' }],
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
