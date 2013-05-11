;(function(){
	
	priorityQueue = function () {
		var queue = new Array();
		var requestCallbacks = new Array();

		var self = {

			onRequest: function(callbackFunction) {
				requestCallbacks.push(callbackFunction);
			},

			callBack: function(track, requests, requesters) {
				for (var i = 0; i < requestCallbacks.length; i++) {
					requestCallbacks[i](track,requests,requesters);
				}
			},

			request: function(url, requestData) {
				var uri = models.Link.fromURL(url).uri;
				var track = models.Track.fromURI(uri);

				for (var i = 0; i < queue.length; i++) {
					if (track.uri == queue[i].track.uri) {
						queue[i].requesters.push(requestData);
						queue[i].requests = queue[i].requests + 1;
						var tmp = queue.splice(i,1)[0];
						this.insert(tmp);
						callBack(tmp.track,tmp.requests,tmp.requesters);
						return;
					}
				}

				var requestRow = {
				track: track,
				requests: 1, // number of requests
				requesters: [ // length == requests
				requestData
				]
				};

				queue.push(requestRow);
				callBack(tmp.track,tmp.requests,tmp.requesters);
			},

			pop: function(trackID) {
				if (trackID) {
					for (var i = 0; i < queue.length; i++) {
						if (queue[i].trackID == trackID) {
							return queue.splice(i,1)[0];
						}
					}
				} else {
					return queue.shift();
				}
			},

			all: function() {
				return queue;
			},

			insert: function(element) {
				if (queue.length == 0) {
					queue.push(element);
					return;
				}

				for (var i = 0; i < queue.length; i++) {
					if (element.requests > queue[i].requests) {
						queue.splice(i,0,element)
						break;
					}
					if (i == queue.length-1) {
						queue.push(element);
						break;
					}
				}
			},

			printQueue: function() {
				for (var i = 0; i < queue.length; i++) {
					document.write(i + ": " + queue[i].artists[0].name + " - " + queue[i].title 
						+ " (trackID: " + queue[i].id +  "), " + queue[i].requests + " requests <br>");
				}
			}
		};
		return self;
	};
})();