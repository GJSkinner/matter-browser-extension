
function save_options() {
	
	var darkmode = document.getElementById('darkmode').checked;
	var keyword = document.getElementById('keyword').checked;
	var sentiment = document.getElementById('sentiment').checked;
  
	chrome.storage.sync.set({
		
		darkmode: darkmode,
		keyword: keyword,
		sentiment: sentiment
	
	}, function() {

		var status = document.getElementById('status');
		status.textContent = 'Options saved.';
		
		setTimeout(function() {
			status.textContent = '';
		}, 750);
		
	});
  
}

function restore_options() {
	
	chrome.storage.sync.get({
		
		darkmode: false,
		keyword: false,
		sentiment: true
		
	}, function(items) {
		
		document.getElementById('darkmode').checked = items.darkmode;
		document.getElementById('keyword').checked = items.keyword;
		document.getElementById('sentiment').checked = items.sentiment;
		
	});
  
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('save3').addEventListener('click', save_options);
document.getElementById('save4').addEventListener('click', save_options);
	
