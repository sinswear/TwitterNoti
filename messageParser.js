/* Detect new message from the stream. */
function getTweets(text, xhr) {
	
	// Headline size.
	if (preLength == 0) {
		preLength = text.length;
	} else {
		preLength += 2;
		
		// Detect the message is not blank.
		if (preLength != text.length) {
			var reader = new bufferedReader(text);
			var data = reader.readLine();
			var tweet = JSON.parse(data);
			
			// Detect the message is a tweet or warning.
			if (tweet.event != null) {

			} else if (tweet.created_at != null) {
				notify(tweet);
			} else if (tweet.delete != null) {
				var id = tweet.delete.status.id_str;
				chrome.notifications.clear(id, function() {});
			} else if (tweet.warning != null) {
				xhr.abort();
				console.log("Stall warning");
			}
			preLength = text.length;
		}
	}
}

/* Retrieve one message from the stream.*/
function bufferedReader (text) {
	var buffer = text.split("\r\n");
	var lines = new Array();
	
	for (i in buffer) {
		if (buffer[i] != "") lines.push(buffer[i]);
	}
	
	this.readLine = function() {
		return lines.pop();
	};
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