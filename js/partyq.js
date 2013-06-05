function ListCtrl($scope) {
  // Initialization
  $scope.filter = '#Spotify';
  $scope.enabled = false;

  // jQuery elements
  var el = {
    options: $('#options'),
    enabled: $('#enabled'),
    filter: $('#filter')
  };

  // Load Spotify apps API
  require([ //{{{
      '$api/models',
      '$views/ui#UI',
      '$views/buttons#Button',
      'js/priority_queue#PriorityQueue',
      'js/twitter_stream#TwitterStream',
      'js/uri_parser#toURI',
      ], function(models, UI, Button, PriorityQueue, TwitterStream, toURI) {

    var queue = new PriorityQueue;
    var twitter = new TwitterStream;
    console.log(twitter);
    twitter.connect();

    // AngularJS hooks
    $scope.updateFilter = function() {
      console.log("filter updated: " + $scope.filter);
      el.enabled.prop('checked', true);
      el.options.addClass('loading');
    }

    // jQUery hooks
    el.filter.change(function() {
      $scope.updateFilter();
    });

    el.enabled.change(function() {
      if (this.checked) { // enabled
        $scope.updateFilter();
      } else { // disabled
        el.options.removeClass('loading');
      }
    })

  }); //}}}
}

