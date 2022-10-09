
function tokenise(aText) {
	
	var cleanText = aText.replace(/([.,])/g, " $1").toLowerCase();
	var tokens = cleanText.split(/[ ]+/);
	
	console.log(tokens);
	return tokens;
	
}

function getSentiment(tokens, vocabNegate, vocabPos, vocabNeg) {
	
	var sentiment = Array(tokens.length).fill(0);
	var negate = false;
	
	for (let i = 0; i < tokens.length; i++) {
		
		if (tokens[i] == "," || tokens[i] == ".") {
			negate = false;
		}
		
		if (vocabNegate.includes(" " + tokens[i] + " ")) {
			negate = true;
		}
		
		if (tokens[i] == "shit") {
			if (sentiment[i - 1] == 1) {
				sentiment[i]++;
			} else {
				sentiment[i]--;
			}
		}
		
		if (vocabPos.includes(" " + tokens[i] + " ")) {
			if (negate == false) {
				sentiment[i]++;
			} else {
				sentiment[i]--;
			}
		}
		
		if (vocabNeg.includes(" " + tokens[i] + " ")) {			
			if (negate == false) {				
				sentiment[i]--;
			} else {				
				sentiment[i]++;
			}
		}
		
	}
	
	console.log(sentiment);
	return sentiment.reduce((a, b) => a + b, 0);
	
}

function getTextBlocks() {
	
	let text = document.body.innerHTML;
	
	var textBlocks = [];
	var fromIndex = 0;
	
	while (fromIndex < text.lastIndexOf('/p>')) {
	
		let openBracket = text.indexOf('<p ', fromIndex);
		let closeBracket = text.indexOf('/p>', openBracket);
		
		var block = text.substring(openBracket, closeBracket);
		
		textBlocks.push(block);
		fromIndex = closeBracket;
		
	}
	
	return textBlocks;
	
}

function highlight(extract){
	
	let text = document.body.innerHTML;
	let re = new RegExp(extract, 'gi'); // search for all instances
	let newText = text.replace(re, `
	<span class = "sentiment_mark_underline">${extract}</span>
	<style>
		span.sentiment_mark_underline {
			border-bottom: 3px solid gold;
			color: currentColor !important;
			text-decoration: none !important;
		}
		@keyframes fadeS {
			from {background-color: transparent;}
			to {background-color: yellow;}
		}
		span.sentiment_mark_underline:hover {
			background-color: yellow;
			animation: fadeS 1s ease forwards;
		}
	</style>
	`);
	document.body.innerHTML = newText;
	
}

function searchSentiment() {
	
	chrome.windows.getCurrent(function (currentWindow) { // all of this is neccersary to get the current tab's id.
		chrome.tabs.query({ active: true, windowId: currentWindow.id }, function (activeTabs) {
			activeTabs.map(function (tab) {
				chrome.scripting.executeScript({
					target: {tabId: tab.id},
					func: getTextBlocks,
				}, function (result) {
					
					var sent = 0;
					var sentNo = 0;
					
					for (let i = 0; i < result[0].result.length; i++) {
						
						let openBracket = result[0].result[i].indexOf('>');
						let closeBracket = result[0].result[i].lastIndexOf('<');
						var cleanText = result[0].result[i].substring(openBracket + 1, closeBracket);
						var sentences = cleanText.split('. ');
					
						for (s in sentences) {
							
							sentNo++;
					
							var tokens = tokenise(sentences[s]);
			
							var vocabNegate = "no not none no one nobody nothing neither nowhere never hardly scarcely barely doesn’t isn’t aren't ain't wasn’t shouldn’t wouldn’t couldn’t won’t can’t don’t";
							var vocabPos = "accomplishment achievement adaptable agreeable amazing angelic appealing attractive awesome beautiful beneficial best brilliant classic convincing cool courageous creative dazzling delight delightful distinguished divine earnest effective effervescent efficient effortless electrifying elegant enchanting encouraging endorsed energetic energized engaging enthusiastic essential esteemed ethical excellent exciting exquisite fabulous fair fantastic favorable fetching fine fitting flourishing fortunate friendly fun funny generous genius genuine giving glamorous glowing good gorgeous graceful great handsome happy harmonious healing healthy hearty heavenly helped helpful honest honored ideal imaginative important impressive incredible independent innovate innovative intellectual intelligent intuitive inventive keen kind knowing knowledgeable legendary love lovely lucid luminous marvelous masterful meaningful merit meritorious miraculous motivating perfect phenomenal pleasant pleasurable plentiful poised polished popular powerful prepared pretty principled productive progress prominent quality reassuring refined refreshing reliable remarkable resounding respected restored reward rewarding right robust satisfactory secure simple skilled skillful stirring stunning stupendous success successful superb terrific thorough thrilling thriving transformative transforming tremendous trusting truthful unreal unwavering upbeat upright upstanding valued vibrant victorious vigorous virtuous vital welcome wholesome wonderful wondrous worthy wow ";
							var vocabNeg = "abysmal adverse alarming appalling ashamed atrocious awful bad banal belligerent boring broken callous clumsy cold cold-hearted collapse confused contradictory corrosive corrupt crazy creepy criminal cruel damaging dastardly decaying deformed deny deplorable depressed deprived despicable detrimental dirty disease disgusting disheveled dishonest dishonorable dismal distress dreadful dreary eroding egregious evil fail faulty fear feeble fight filthy foul frighten frightful ghastly grave greed grim grimace gross grotesque gruesome guilty hard hard-hearted harmful hate hideous horrendous horrible hostile hurtful ignorant immature imperfect inane inelegant infernal insane insidious insipid jealous junk lazy lousy malicious mean menacing messy naive nasty naughty nonsense noxious objectionable odious offensive oppressive outrageous poisonous prejudice questionable reptilian repugnant repulsive rotten scandalous self-centred selfish shocking shoddy sick sickening sinister slimy stupid sucks suffer suffered suffering terrible terrifying threatening tough unfair unjust vicious vile villainous vindictive wary waste weary wicked woeful worthless wrong ";
							
							var sentiment = getSentiment(tokens, vocabNegate, vocabPos, vocabNeg);							
							
							if (sentiment != 0) {
								
								sent++;
								
								chrome.scripting.executeScript({
									target: {tabId: tab.id},
									func: highlight,
									args: [sentences[s]],
								});
							
							}
							
						}
						
					}
					
					var sentCent = (sent / sentNo) * 100;
					console.log(sentCent);
					siteSraper(sentCent);
					
				});
			});
		});
	});
  
}

