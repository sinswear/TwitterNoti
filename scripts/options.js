function save() {
    var retweetWays = document.getElementById("RT").value;
    localStorage.setItem("display", retweetWays);
    if (!retweetWays) return;
	  statusUpdate("Options saved.");
}

function reset() {
  localStorage.setItem("display", 1);
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
	var retweet_ways = localStorage.getItem("display");
	if (!retweet_ways) return;
	var retweetOption = document.getElementById("RT");
	retweetOption.value = retweet_ways;
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelector("#save").addEventListener("click", save);
  document.querySelector("#reset").addEventListener("click", reset);
  restore();
});