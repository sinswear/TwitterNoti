var oauth = ChromeExOAuth.initBackgroundPage({
	  'request_url': 'https://api.twitter.com/oauth/request_token',
	  'authorize_url': 'https://api.twitter.com/oauth/authorize',
	  'access_url': 'https://api.twitter.com/oauth/access_token',
	  'consumer_key': 'x2nBz8KQP5zoBuziPCiF7g',
	  'consumer_secret': 'saialBfQFryAg4xwC9uF4vlV2PgQkiwt5bNFBouUswQ'
});

var numStream;
/* Init to call a delay connectToStream() */
window.onload = function() {
    numStream = 0;
    connectToStream();
}

function run() {/* Reload page */};


/* Connect to the stream. */
function connectToStream() {
	if (numStream == 0) {
		oauth.authorize(function() {
			var url = 'https://userstream.twitter.com/1.1/user.json';
			var request = {
					'method': 'GET',
					'parameters': {'stall_warnings': 'true'}
			};
			oauth.connect(url, getTweets, request, onStreamError, onStreamEnd);
		});
        numStream++;
		console.log("stream connection: " + numStream);
	} else {
        console.log("Stream connection: " + numStream);
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
	numStream--;
	console.log("Stream connection: " + numStream);
	
	if (numStream == 0) {
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
    run();
});


/**
 * Data process
 * ------------------
 */
var preDataLength = 1;

/* Detect new message from the stream. */
function getTweets(text, xhr) {
	var reader = new bufferedReader(text);

	if (reader.length > preDataLength) {
		preDataLength = reader.length;
		var data = reader.readLine();
		var tweet = JSON.parse(data);
			
		// Detect the message is a tweet or warning.
		if (!!tweet.event) {

		} else if (!!tweet.created_at) {
			notify(tweet);
		} else if (!!tweet.delete) {
			var id = tweet.delete.status.id_str;
			chrome.notifications.clear(id, function() {});
		} else if (!!tweet.warning) {
			xhr.abort();
			console.log("Stall warning");
		}

	}
}

/* Read the stream data.*/
function bufferedReader (text) {
	var buffer = text.split("\r\n");
	var lines = new Array();
	
	for (var i in buffer) {
		if (buffer[i] != "") lines.push(buffer[i]);
	}
	
	this.readLine = function() {
		return lines.pop();
	};

	this.length = lines.length;
}


/* Parse Html entities code to normal string. */
function htmlParser(text) {
	var p = document.createElement("p");
	p.innerHTML = text;	
	var tweetText = p.textContent;
	
	return tweetText;
}

/* Convert Date to display form. */
function parseDateString(date) {
	var hour = date.getHours();
	var minute = date.getMinutes();
	var day = date.getDate();
	var month = date.getMonth() + 1;
	var daySeperater = "AM";

	if (hour >= 12) {
		daySeperater = "PM";
	}

	if (hour > 12) {
		hour = hour - 12;
	}
	if (hour == 0) {
		hour = 12;
	}

	if (minute < 10) {
		minute = "0" + minute;
	}

	switch(month) {
		case 1:
			month = "Jan";
			break;
		case 2:
			month = "Feb";
			break;
		case 3:
			month = "Mar";
			break;
		case 4:
			month = "Apr";
			break;
		case 5:
			month = "May";
			break;
		case 6:
			month = "Jun";
			break;
		case 7:
			month = "Jul";
			break;
		case 8:
			month = "Aug";
			break;
		case 9:
			month = "Sep";
			break;
		case 10:
			month = "Oct";
			break;
		case 11:
			month = "Nov";
			break;
		case 12:
			month = "Dec";
			break;
	}

	var newDate = hour + ":" + minute + " " + daySeperater + " - " + day + " " + month;
	return newDate;
}

/**
 * Notification
 * -------------
 */

/* Notify user a new tweet. */
function notify(data) {
	var tweet;
	var isRetweet = !!data.retweeted_status;
	var isImage = (!!data.entities.media && data.entities.media[0].type == "photo");
	var id = data.id_str;
	var date = new Date(data.created_at);
	
	// Detect the tweet is a retweet or not.
	if (isRetweet) {
		tweet = data.retweeted_status;
	} else {
		tweet = data;
	}
	
	var tweetText = htmlParser(tweet.text);
	
	// Notification's option.
	var options = {
			type: "basic",
			title: tweet.user.name,
			message: tweetText,
			iconUrl: tweet.user.profile_image_url_https.replace("normal", "bigger"),
			contextMessage: parseDateString(date),
			isClickable: decideClickable(tweet.entities.media, tweet.entities.urls[0])
	};
	
	// Image options, retweet options, link data.
	options = changeOptions(data, tweet, options, isImage, isRetweet);
	updateUrl(id, tweet, isImage);
	
	chrome.notifications.create(id, options, function(){});
}


/* Return new options for image or retweet. */
function changeOptions(data, tweet, basicOptions, isImage, isRetweet) {
	var options = basicOptions;

	if (isImage) {
		options.type = "image";
		options.imageUrl = tweet.entities.media[0].media_url_https;		
	}
	
	if (isRetweet) {
		// If option RT ways is person.
		if (localStorage["display"] == 0) {
			options.title = data.user.name;
			options.message = "RT @" + tweet.user.name + ": " + options.message;
			options.iconUrl = data.user.profile_image_url_https.replace("normal", "bigger");
		}
	}
	return options;
}

function decideClickable(image, tweetURL) {
	return (!!image || !!tweetURL);
}

/* Update link data. */
function updateUrl(id, tweet, isImage) {
	if (isImage) {
		sessionStorage.setItem(id, tweet.entities.media[0].url);
	} else if (tweet.entities.urls.length > 0) {
		sessionStorage.setItem(id, tweet.entities.urls[0].expanded_url);
	}
}


/* Detect a link. True, jump to a new tab. */
chrome.notifications.onClicked.addListener(function(id) {	
	if (!!sessionStorage.getItem(id)) {
		chrome.tabs.create({url: sessionStorage.getItem(id)});
	}
	chrome.notifications.clear(id, function() {});
});

/* Remove unused data. */
chrome.notifications.onClosed.addListener(function(id, byUser) {
	sessionStorage.removeItem(id);
});


/* On icon clicked, jump to a new tab: twitter homepage. */
chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.create({url: "https://twitter.com/"});
});