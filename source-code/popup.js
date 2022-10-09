
function getURL() { // gets the url of the current webpage and passes it to the getData function.

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		var url = tabs[0].url;
		getData(url);
	})
	
}

function getData(rawUrl) { // this function will use the url to retrieve data about the given site. 
	
	let start = rawUrl.indexOf('www.');
	let end = rawUrl.indexOf('/', start);
	
	var siteUrl = rawUrl.substring(start + 4, end);
	
	console.log(siteUrl);
	
	var dataURL = 'https://www.alexa.com/siteinfo/' + siteUrl;
	chrome.tabs.create({ url: dataURL});
	
	//console.log('url: ', url);
	
}

function startertoo() {
	
	var callbacktoo = function(fileText) {
		
		let title = fileText.indexOf('<h3>Engagement</h3>');
		let dataOne = fileText.indexOf('<p class="small data">', title);
		let dataOneR = fileText.indexOf('<span', dataOne + 22);
		
		let dataTwo = fileText.indexOf('<p class="small data">', dataOneR);
		let dataTwoR = fileText.indexOf('<span', dataTwo + 22);
		
		let dataThree = fileText.indexOf('<p class="small data">', dataTwoR);
		let dataThreeR = fileText.indexOf('%', dataThree + 22);
		
		let alexa = fileText.indexOf('This site ranks:');
		let alexaOne = fileText.indexOf('<span>#</span>', alexa);
		
		var featVec = ((100 - parseFloat(fileText.substring(dataOneR - 5, dataOneR - 1)).toFixed(2)) + "," 
						+ (parseFloat(fileText.substring(dataThreeR - 4, dataThreeR)).toFixed(2)) + ","
						+ (parseFloat(fileText.substring(alexaOne + 14, alexaOne + 25).replace(',', '')).toFixed(2)) + ",");
		
		if (featVec.includes('NaN')) {
			featVec = '1.00,100.00,1000000.00,';
		} 
		
		console.log("Network feature vector: ", featVec);
		
		getPrediction(featVec, "https://cseegit.essex.ac.uk/ce301_21-22/CE301_skinner_george_j/-/raw/master/Datasets/networkdataset.txt");
		
	}
	
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		
		var rawUrl = tabs[0].url;
		let start = rawUrl.indexOf('www.');
		let end = rawUrl.indexOf('/', start);
		
		var siteUrl = rawUrl.substring(start + 4, end);
		
		var dataURL = 'https://www.alexa.com/siteinfo/' + siteUrl;
		
		gets(callbacktoo, dataURL);
		
	})
	
}

//document.querySelector('#runKNN').addEventListener('click', startertoo) // runs when the 'get url' button clicked.

function getText() { // returns the text of the current webpage in the form of a string.
	
	return document.body.innerText;

}

function siteSraper(sentimentVal) { // executes the getText function within the webpage and outputs the result.
	
	chrome.windows.getCurrent(function (currentWindow) { // all of this is neccersary to get the current tab's id.
		chrome.tabs.query({ active: true, windowId: currentWindow.id }, function (activeTabs) {
			activeTabs.map(function (tab) {
				chrome.scripting.executeScript({
					target: {tabId: tab.id},
					func: getText,
					args: [sentimentVal],
				}, function (result) {
					
					var exclamNo = getInstances('!', result[0].result);
					var questionNo = getInstances('\\?', result[0].result);
					var capitalNo = getInstances(/[A-Z]/, result[0].result);
					var secondPerNo = getInstances('you', result[0].result);
					var firstPerNo = getInstances('I ', result[0].result) 
						+ getInstances(' me ', result[0].result) 
						+ getInstances(' my', result[0].result);
					var modalAdvNo = getInstances(' can ', result[0].result) 
						+ getInstances('could', result[0].result) 
						+ getInstances('may', result[0].result);
						
					var punctuationNo = getInstances(/[.,\/#!$%\^&\*;:{}=\-_`~()]/, result[0].result);	
					var letterNo = result[0].result.length;
					var wordNo = result[0].result.split(' ').length;
					
					var featVec = ((exclamNo / punctuationNo) * 100).toFixed(2) + "," 
						+ ((questionNo / punctuationNo) * 100).toFixed(2) + ","
						+ ((capitalNo / letterNo) * 100).toFixed(2) + ","
						+ ((secondPerNo / wordNo) * 100).toFixed(2) + ","
						+ ((firstPerNo / wordNo) * 100).toFixed(2) + ","
						+ ((modalAdvNo / wordNo) * 100).toFixed(2) + ","
						+ sentimentVal.toFixed(2) + ",";
					
					console.log("Linguistic feature vector: ", featVec);
					
					getPrediction(featVec, "https://cseegit.essex.ac.uk/ce301_21-22/CE301_skinner_george_j/-/raw/master/Datasets/dataset.txt");
					
				});
			});
		});
	});
	
}

function getInstances(subString, string) {
	
	var regex = new RegExp(subString, 'g');
	var instances = (string.match(regex) || []).length;
	return instances;
	
}

chrome.storage.sync.get("darkmode", function(items) {
	
	if (items.darkmode) {
		let text = document.body.innerHTML;
		let newText = `
		<style>
			html {
				color: white;
				background-color: black;
			}
			a:link {
				color: white;
				text-decoration: none;
			}
		</style>
		`;
		document.body.innerHTML = text + newText;
	}
	
});
	
