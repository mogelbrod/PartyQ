var trackUriRegexp = [
  /spotify:track:([a-z0-9]+)/i,
  /https?:\/\/open.spotify.com\/track\/([a-z0-9/]+)\/?/i
];

exports.toURI = function(str, callback) {
  if (!str || str == "")
    return null;

  // Try regular track URI matching
  for (var i in trackUriRegexp) {
    var res = trackUriRegexp[i].exec(str);
    if (!res) continue;
    return 'spotify:track:' + res[1];
  }

  if (str.substr(0,15) == "http://spoti.fi" ) {
    /*
      * $.ajax({
      *   type: "GET",
      *   str: str,
      *   success: function(data) {
      *     $(data).find('meta[property="og:str"]').each(function() {
      *       console.log($(this).text());
      *     });
      *   }
      * });
      */
    return null;
  }

  return null;
};
