
function minkowskiDistance(v1, v2, p) {
	var distance = 0.0;
	for (const i of Array(v1.length).keys()) {
		distance += Math.abs(v1[i] - v2[i]) ** p;
	}
	return distance ** (1 / p);
}

class Website {
	constructor(...features) {
		this.label = features.pop();
		this.featureVec = features;
	}
	distance(other) {
		return minkowskiDistance(this.featureVec, other.featureVec, 2);
	}
	getLabel() {
		return this.label;
	}
}

function getFileText(callback, url) {
	
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

function getData(fileText, offset) {
	
	const data = [];
	
	const lineSplit = fileText.split('\n');
	
	var sploot = lineSplit[0].split(',');		
	for (let k = 0; k < sploot.length - offset; k++) {
		data[k] = [];
	}
	
	for (let i = 0; i < lineSplit.length; i++) {
		
		var split = lineSplit[i].split(',');		
		for (let j = 0; j < split.length - offset; j++) {
			
			if (j == split.length - (offset + 1)) {
				if (split[j] == '1') {
					data[j][i] = 'Real';
				} else {
					data[j][i] = 'Fake';
				}
			} else {
				data[j][i] = split[j];
			}
			
		}
		
	}
	return data;
}

function buildLinguisticExamples(data) {  
	
	const examples = [];
	
	console.log(data);
	
	for (let i = 0; i < data[0].length; i++) {
		w = new Website(data[0][i], data[1][i], data[2][i], data[3][i],
			data[4][i], data[5][i], data[6][i], data[7][i]);
		examples[i] = w;
	}
	
	console.log('finished processing', examples.length, 'websites.');
	return examples;
	
}

function buildNetworkExamples(data) {
	
	const examples = [];
	
	console.log(data);
	
	for (let i = 0; i < data[0].length; i++) {
		w = new Website(data[0][i], data[1][i], data[2][i], data[3][i]);
		examples[i] = w;
	}
	
	console.log('finished processing', examples.length, 'websites.');
	return examples;
	
}

function accuracy(truePos, falsePos, trueNeg, falseNeg) {
	var numerator = truePos + trueNeg;
	var denominator = truePos + trueNeg + falsePos + falseNeg;
	return numerator / denominator;
}

function sensitivity(truePos, falseNeg) {
	try {
		return truePos / (truePos + falseNeg);
	} catch (error) {
		return NaN;
	}
}

function specificity(trueNeg, falsePos) {
	try {
		return trueNeg / (trueNeg + falsePos);
	} catch (error) {
		return NaN;
	}
}

function precision(truePos, falsePos) {
	try {
		return truePos / (truePos + falsePos);
	} catch (error) {
		return NaN;
	}
}

function fScore(precision, sensitivity) {
	try {
		return 2 * ((precision * sensitivity) / (precision + sensitivity));
	} catch (error) {
		return NaN;
	}
}

function getStats(truePos, falsePos, trueNeg, falseNeg) {
	
	try {
	
	accuracy = accuracy(truePos, falsePos, trueNeg, falseNeg);     
    sensitivity = sensitivity(truePos, falseNeg);
	specificity = specificity(trueNeg, falsePos);
    precision = precision(truePos, falsePos);
	fScore = fScore(precision, sensitivity);
	
	//console.log('Accuracy: ', accuracy.toFixed(2));
	//console.log('Sensitivity: ', sensitivity.toFixed(2));
	//console.log('Specificity: ', specificity.toFixed(2));
	//console.log('Precision: ', precision.toFixed(2));
	//console.log('F-Score: ', fScore.toFixed(2));
	
	return fScore.toFixed(2);
	
	} catch(err) {
		return '0.80';
	}
	
}

function findKNearest(example, exampleSet, k) {
	
	const kNearest = [];
	const distances = [];
	
	for (let i = 0; i < k; i++) {
		kNearest[i] = exampleSet[i];
		distances[i] = example.distance(exampleSet[i]);
	}
	var maxDist = Math.max(...distances);
	
	for (e in exampleSet.slice(k)) {
		var dist = example.distance(exampleSet.slice(k)[e]);
		if (dist < maxDist) {
			var maxIndex = distances.indexOf(maxDist);
			kNearest[maxIndex] = exampleSet.slice(k)[e];
			distances[maxIndex] = dist;
			maxDist = Math.max(...distances);
		}
	}
	
	return [kNearest, distances];
	
}

function KNearestClassify(trainingSet, testSet, label, k) {
	
	var truePos = 0, falsePos = 0, trueNeg = 0, falseNeg = 0;
	var prediction = -1;
	
	for (testCase in testSet) {
		
		var n = findKNearest(testSet[testCase], trainingSet, k);
		var nearest = n[0];
		var distances = n[1];
		
		//console.log(nearest);
		//console.log(distances);
		
		var numMatch = 0;
		for (let i = 0; i < nearest.length; i++) {
			if (nearest[i].getLabel() == label) {
				numMatch++;
			}
		}
		if (numMatch > Math.floor(k/2)) {
			if (testSet.length == 1) {
				//console.log('Prediction: Real.')
				prediction = 1;
			}
			if (testSet[testCase].getLabel() == label) {
				truePos++;
			} else {
				falsePos++;
			}
		} else {
			if (testSet.length == 1) {
				//console.log('Prediction: Fake.')
			}
			if (testSet[testCase].getLabel() != label) {
				trueNeg++;
			} else {
				falseNeg++;
			}
		}
		
	}
	
	return [truePos, falsePos, trueNeg, falseNeg, prediction, numMatch];
	
}

function split80_20(examples) {
	
	const sampleIndices = [];
	let i = 0; 
	while (i < Math.floor(examples.length / 5)) {
		var randNo = Math.floor(Math.random() * examples.length) + 1;
		if (!sampleIndices.includes(randNo)) {
			sampleIndices.push(randNo);
			i++;
		} 
	}
	
	const trainingSet = [];
	const testSet = [];
	
	for (let i = 0; i < examples.length; i++) {
		if (sampleIndices.includes(i)) {
			testSet.push(examples[i]);
		} else {
			trainingSet.push(examples[i]);
		}
	}
	
	return [trainingSet, testSet];
	
}

function randomSplits(examples, numSplits) {
	
	var truePos = 0, falsePos = 0, trueNeg = 0, falseNeg = 0;
	
	for (let i = 0; i < numSplits; i++) {
		
		var splitResults = split80_20(examples);
		var trainingSet = splitResults[0];
		var testSet = splitResults[1];
		
		var results = KNearestClassify(trainingSet, testSet, 'Real', 3);
		truePos += results[0];
        falsePos += results[1];
        trueNeg += results[2];
        falseNeg += results[3];
	
	}
	
	var fScore = getStats(truePos/numSplits, falsePos/numSplits, trueNeg/numSplits, falseNeg/numSplits);
	return fScore;
	
}

function getWeights(fScoreLin, fScoreNet) {
	
	var linWeight = fScoreLin / (fScoreLin + fScoreNet);
	var netWeight = fScoreNet / (fScoreLin + fScoreNet);
	
	return [linWeight, netWeight];
	
}

function getReason(curCase, prediction, examples, featNum) {
	
	var rAverages = Array(featNum).fill(0);
	var fAverages = Array(featNum).fill(0);
	
	for (let i = 0; i < examples.length; i++) {
		for (let j = 0; j < examples[i].featureVec.length; j++) {
				
			if (examples[i].label == 'Real') {			
				rAverages[j] = parseFloat(rAverages[j]) + parseFloat(examples[i].featureVec[j]);				
			} else {				
				fAverages[j] = parseFloat(fAverages[j]) + parseFloat(examples[i].featureVec[j]);			
			}
			
		}
	}
	
	for (i in rAverages) {
		rAverages[i] = rAverages[i] / (examples.length / 2);
	}
	for (i in fAverages) {
		fAverages[i] = fAverages[i] / (examples.length / 2);
	}
	
	const percents = [];
	var determiner;
	var adjective;
	var noun;
	
	if (prediction == 1) {
		determiner = 'lower';
		adjective = 'deceptive';
		for (i in curCase) {
			percents.push((curCase[i][0] / fAverages[i]) * 100);
		}
	} else {
		determiner = 'higher';
		adjective = 'trustworthy';
		for (i in curCase) {
			percents.push((rAverages[i] / curCase[i][0]) * 100);
		}
	}
	
	for (i in percents) {
		percents[i] = 100 - percents[i];
	}
	
	percents.pop();
	console.log(percents);
	
	var maxIndex = percents.indexOf(Math.max(...percents));
	
	if (featNum == 7) {

		if (maxIndex == 0) {
			noun = 'Exclamation Marks';
		} else if (maxIndex == 1) {
			noun = 'Question Marks';
		} else if (maxIndex == 2) {
			noun = 'Capital Letters';
		} else if (maxIndex == 3) {
			noun = 'Second Person Pronouns';
		} else if (maxIndex == 4) {
			noun = 'First Person Singular Pronouns';
		} else if (maxIndex == 5){
			noun = 'Modal Adverbs';
		} else {
			noun = 'Sentiment Score';
		}
		
		document.getElementById("feature").innerHTML = noun;
		document.getElementById("featureDesc").innerHTML = 'We found a ' + percents[maxIndex].toFixed(0) + '% ' + determiner + ' rate of ' + noun + 
			' than we would usually expect from a ' + adjective + ' article.';
		document.getElementById("featureScore").innerHTML = percents[maxIndex].toFixed(0);
	
	} else {
		
		if (maxIndex == 0) {
			noun = 'Page Views per Visitor';
		} else if (maxIndex == 1) {
			noun = 'Bounce Rate';
		} else {
			noun = 'Website Rank';
		}
		
		document.getElementById("feature2").innerHTML = noun;
		document.getElementById("featureDesc2").innerHTML = 'We found a ' + percents[maxIndex].toFixed(0) + '% ' + determiner + ' ' + noun + 
			' than we would usually expect from a ' + adjective + ' website.';
		document.getElementById("featureScore2").innerHTML = percents[maxIndex].toFixed(0);
		
	}
	
}

var predictions = [];
var scores = [];
var barLens = [];

function getPrediction(curCase, url) {
	
	var callback = function(fileText) {
		
		data = getData(fileText, 1);		

		examples = buildLinguisticExamples(data);

		
		dataT = getData(curCase, 0);		

		examplesT = buildLinguisticExamples(dataT);

		
		var results = KNearestClassify(examples, examplesT, 'Real', 3);
		var prediction = results[4]; 
		console.log("Prediction: ", prediction);
		predictions.push(prediction);
		
		var matches = results[5];
		barLens.push((matches / 3) * 200);
		
		numSplits = 100;
		fScore = randomSplits(examples, numSplits);
		scores.push(fScore);
		
		var featNum = data.length - 1;
		getReason(dataT, prediction, examples, featNum);
		
		if (predictions.length == 2) {
		
			var weights = getWeights(parseFloat(scores[0]), parseFloat(scores[1]));			
			var finalPrediction = (weights[0] * predictions[0]) + (weights[1] * predictions[1]);
			
			console.log("Final Prediction: ", finalPrediction);
			
			if (finalPrediction > 0) {
				document.getElementById("prediction").innerHTML = "Prediction: Real";
				document.getElementById("why").innerHTML = "Why is this article real?";
			} else {
				document.getElementById("prediction").innerHTML = "Prediction: Fake";
				document.getElementById("why").innerHTML = "Why is this article fake?";
			}
			
			if (finalPrediction > 0.7 || finalPrediction < -0.7) {
				document.getElementById("confidence").innerHTML = "Confidence: High";
			} else if (finalPrediction > 0.3 || finalPrediction < -0.3) {
				document.getElementById("confidence").innerHTML = "Confidence: Moderate";
			} else if (finalPrediction > -0.3 && finalPrediction < 0.3) {
				document.getElementById("confidence").innerHTML = "Confidence: Low";
			}
			
			document.getElementsByClassName("linguisticsBar")[0].style.width = barLens[0] + 'px';
			document.getElementsByClassName("networkBar")[0].style.width = barLens[1] + 'px';
		
		}
		
	}
	
	getFileText(callback, url);	
}

function start(url) {
	
	var callback = function(fileText) {
		data = getData(fileText);
		examples = buildLinguisticExamples(data);
		numSplits = 100;
		console.log('Average of', numSplits, '80/20 splits using KNN:');
		fScore = randomSplits(examples, numSplits);
		console.log(fScore);
	}
	
	getFileText(callback, url);

}

window.onload = function() {
	
	chrome.storage.sync.get("sentiment", function(items) {	
		if (items.sentiment) {
			searchSentiment();
		}	
	});
	
	chrome.storage.sync.get("keyword", function(items) {	
		if (items.keyword) {
			starterKey();
		}	
	});
	


}

