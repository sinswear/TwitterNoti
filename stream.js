var oauth = ChromeExOAuth.initBackgroundPage({
	  'request_url': 'https://api.twitter.com/oauth/request_token',
	  'authorize_url': 'https://api.twitter.com/oauth/authorize',
	  'access_url': 'https://api.twitter.com/oauth/access_token',
	  'consumer_key': 'x2nBz8KQP5zoBuziPCiF7g',
	  'consumer_secret': 'saialBfQFryAg4xwC9uF4vlV2PgQkiwt5bNFBouUswQ'
});

var preLength = 0;
var streamCount = 0;

/* Init */
init();

function init() {
	if (streamCount == 0 || isNaN(streamCount) == true) {
		chrome.alarms.create("init", {delayInMinutes: 0.2});
		streamCount = 0;
	}
}

function run() {}


/* Connect to the stream. */
function connectStream() {
	streamCount++;
	if (streamCount == 1) {
		oauth.authorize(function() {
			var url = 'https://userstream.twitter.com/1.1/user.json';
			var request = {
					'method': 'GET',
					'parameters': {'stall_warnings': 'true'}
			};
			oauth.connect(url, getTweets, request, onStreamError, onStreamEnd);
		});
		preLength = 0;
		console.log("stream connection: " + streamCount);
	} else {
		streamCount == 1;
	}
}


/* On stream error, log status code. */
function onStreamError(status, xhr) {
	if (status == 420) {
		console.log("Stream Error: HTTP 420");
	} else if (status >= 400) {
		console.log("Stream Error: " + status);
	} else {
		console.log("Stream Unknown Error: " + status);
	}
}

/* Reconnect to the stream. */
function onStreamEnd(xhr) {
	console.log("Stream Closed");
	streamCount--;
	console.log("Stream connection: " + streamCount);
	
	if (streamCount == 0) {
		if (xhr.status == 420) {				
			chrome.alarms.create("error420", {delayInMinutes: 1.0});
			console.log("Reconnect after 1 min.");		
			
		} else {	
			chrome.alarms.create("error", {delayInMinutes: 0.2});
			console.log("Reconnect after 5 sec.");
		}
	}
}

chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name == "init") {
    connectStream();
  } else {
    run();
  }
});