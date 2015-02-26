var outElem = document.querySelector("#out");

var worker = new Worker("worker.js");

worker.onmessage = function(e) {
	results = [];
	for (var i = 0; i < e.data.numbers.length; i++) {
		var num = e.data.numbers[i];
		results.push(num.ans + " (" + num.time + "ms)");
	};
	out.innerText = "Result(s): " + results.join(",") + "\nIterations: " + e.data.iterations + "\nPermutations: " + e.data.permutations;
}

worker.postMessage();