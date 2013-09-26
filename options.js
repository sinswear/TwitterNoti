function save() {
    var retweetWays = document.getElementById("RT").value;
    localStorage.setItem("Retweet_Ways", retweetWays);
    if (!retweetWays) return;
	  statusUpdate("Options saved.");
}

function reset() {
  localStorage.setItem("Retweet_Ways", 1);
  statusUpdate("Reset completed.");
}

function statusUpdate(text) {
  var optionStatus = document.getElementById("status");
	optionStatus.innerHTML = text;
	setTimeout(function() {
    optionStatus.innerHTML = "";
	}, 750);
}

function restore() {
	var retweet_ways = localStorage.getItem("Retweet_Ways");
	if (!retweet_ways) return;
	var retweetOption = document.getElementById("RT");
	retweetOption.value = retweet_ways;
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelector("#save").addEventListener("click", save);
  document.querySelector("#reset").addEventListener("click", reset);
  restore();
});