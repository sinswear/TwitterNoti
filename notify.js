/* Notify a new tweet. */
function notify(data) {
	var tweet;
	var isRetweet = (data.retweeted_status != null);
	var isImage = (data.entities.media != null && data.entities.media[0].type == "photo");
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
			contextMessage: parseDateString(date)
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
		if (localStorage.Retweet_Ways == 0) {
			options.title = data.user.name;
			options.message = "RT @" + tweet.user.name + ": " + options.message;
			options.iconUrl = data.user.profile_image_url_https.replace("normal", "bigger");
		}
	}
	return options;
}

/* Update link data. */
function updateUrl(id, tweet, isImage) {
	
	if (isImage) {
		sessionStorage.setItem(id, tweet.entities.media[0].url);
		
	} else if (tweet.entities.urls.length != 0) {
		sessionStorage.setItem(id, tweet.entities.urls[0].expanded_url);
	}
}


/* Detect a link. True, jump to a new tab. */
chrome.notifications.onClicked.addListener(function(id) {
	
	if (sessionStorage.getItem(id) != null) {
		chrome.tabs.create({url: sessionStorage.getItem(id)}, function(){});
	}
});

/* Remove unused data. */
chrome.notifications.onClosed.addListener(function(id, byUser) {
	sessionStorage.removeItem(id);
});


/* On icon clicked, jump to a new tab: twitter homepage. */
chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.create({url: "https://twitter.com/"}, function(){});
});