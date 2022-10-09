
function gets(callback, url) {
	
	var file = new XMLHttpRequest();
    file.open("GET", url);
	
    file.onreadystatechange = function () {		
        if(file.readyState === XMLHttpRequest.DONE) {			
            if(file.status === 0 || (file.status >= 200 && file.status < 400)) {
				
                var fileText = file.responseText;
				callback.apply(this, [fileText]);
				
            }			
        }		
    }
    file.send(null);
	
}

function highlighter(term, alink) {

	let text = document.body.innerHTML;
	let regText = term + '+(?![^<]*>)';
	let re = new RegExp(regText, 'gi'); // search for all instances
	let newText = text.replace(re, `
	<a class = "wap" href = ${alink}>
		<span class = "keyword_mark_underline">${term}</span>
	</a>
	<style>
		span.keyword_mark_underline {
			border-bottom: 3px solid red;
		}
		@keyframes fadeK {
			from {background-color: transparent;}
			to {background-color: pink;}
		}
		span.keyword_mark_underline:hover {
			background-color: pink;
			animation: fadeK 1s ease forwards;
		}
		.wap {
			color: currentColor !important;
			text-decoration: none !important;
		}
	</style>
	`);
	document.body.innerHTML = newText;
  	
}

function search(term, alink) {
	
	chrome.windows.getCurrent(function (currentWindow) { // all of this is neccersary to get the current tab's id.
		chrome.tabs.query({ active: true, windowId: currentWindow.id }, function (activeTabs) {
			activeTabs.map(function (tab) {
				chrome.scripting.executeScript({
					target: {tabId: tab.id},
					func: highlighter,
					args: [term, alink],
				});
			});
		});
	});
  
}

function starterKey() {
	
	var callback = function(fileText) {
		
		const lineSplit = fileText.split('\n');		
		for (let i = 0; i < lineSplit.length - 1; i++) {
			
			var split = lineSplit[i].split(',');
			search(split[0], split[1]);
			
		}
		
	}
	
	gets(callback, 'https://cseegit.essex.ac.uk/ce301_21-22/CE301_skinner_george_j/-/raw/master/Datasets/keywords.txt');
	
}

