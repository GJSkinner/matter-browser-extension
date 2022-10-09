// https://ml-cheatsheet.readthedocs.io/en/latest/logistic_regression.html

function sigmoid(z) {
	
	let returnArray = [];
	for (let i = 0; i < z.length; i++) {
		returnArray.push(1 / (1 + Math.pow(2.71828, -z[i])));
	}
	return returnArray
}

function multiplyMatrices(a, b) {
	
	let x = a.length;
	let y = b[0].length;
	let z = a[0].length;
	
	let productRow = Array.apply(null, new Array(y)).map(Number.prototype.valueOf, 0);
	let product = new Array(x);
	
	for (let p = 0; p < x; p++) {
		product[p] = productRow.slice();
	}
	
	for (let i = 0; i < x; i++) {
		for (let j = 0; j < y; j++) {
			for (let k = 0; k < z; k++) {
				product[i][j] += a[i][k] * b[k][j];
			}
		}
	}
	
	return product;
	
}

function transposeArray(array) {
	
	return array[0].map((_, colIndex) => array.map(row => row[colIndex]));
	
}

function predict(features, weights) {

	var z = multiplyMatrices(features, weights);
	
	return sigmoid(z);
	
}

function costFunc(features, labels, weights) {
	
	var observations = labels.length;
	
	var predictions = predict(features, weights);
	
	var class1_cost = [];
	var class2_cost = [];
	
	for (let i in labels) {
		class1_cost.push(-labels[i] * Math.log(predictions[i]));
		class2_cost.push((1 - labels[i]) * Math.log(1 - predictions[i]));
	}
	
	var cost = [];
	
	for (let i in class1_cost) {
		cost.push(class1_cost[i] - class2_cost[i]);
	}
	
    var cost = cost.reduce((a, b) => a + b, 0) / observations;
	
	return cost;
	
}

function update_weights(features, labels, weights, lr) {
	
	var N = features.length;
	
	var predictions = predict(features, weights);
	
	for (let i in predictions) {
		predictions[i] = predictions[i] - labels[i]
	}
	
	var gradient = multiplyMatrices(transposeArray(features), predictions);
	
	for (let i in gradient) {
		gradient[i] = gradient[i] / N;
		gradient[i] = gradient[i] * lr;
	}
	
	for (let i in weights) {
		weights[i] = weights[i] - gradient[i];
	}
	
	return weights;
	
}

function decision_boundary(prob) {
	
	let decision;
	
	if (prob >= 0.5) {
		decision = 1;
	} else {
		decision = 0;
	}
	
	return decision;
	
}

function classify(predictions) {
	
	return decision_boundary(predictions).flat();
	
}


function train(features, labels, weights, lr, iters) {
	
	var cost_history = [];
	
	for (let i = 0; i < iters; i++) {
		
		var weights = update_weights(features, labels, weights, lr);
		
		var cost = costFunc(features, labels, weights);
		cost_history.push(cost);
		
		console.log("iteration: ", i, " | cost: ", cost);
	
	}
	
	return weights
	
}

var features = [
	[1.04, 3.13, 14.11, 1.88, 1.01, 0.00],
	[6.67, 8.33, 19.05, 0.40, 0.60, 0.60],
	[8.26, 11.01, 10.03, 0.00, 0.15, 0.15],
	[3.51, 0.00, 37.95, 0.27, 1.26, 0.27],
	[0.97, 1.62, 7.17, 0.13, 0.17, 0.34],
	[0.00, 1.14, 4.17, 0.28, 0.14, 0.28],
	[0.00, 0.00, 7.03, 0.13, 0.79, 0.00],
	[0.63, 1.26, 9.54, 0.71, 0.31, 0.10],
	[0.00, 1.91, 20.58, 0.29, 1.27, 0.00],
	[0.24, 0.98, 3.50, 0.61, 0.58, 0.48]
];

var labels = [
	[0],
	[0],
	[0],
	[0],
	[0],
	[1],
	[1],
	[1],
	[1],
	[1]
];

var weights = [
	[0],
	[0],
	[0],
	[0],
	[0],
	[0]
];

function lr() {
	
	var finalWs = train(features, labels, weights, 0.1, 100);
	console.log('final weights: ', finalWs);
	
}

document.querySelector('#runLR').addEventListener('click', lr)

