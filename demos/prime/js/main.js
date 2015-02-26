$(function() {
	var primeArr = [];
	var num = 2;
	while (primeArr.length < 100) {
		var isPrime = true;
		for (var t = 2; t < num; t++) {
			if (num % t == 0) {
				isPrime = false;
				break;
			}
		};
		if (isPrime) {
			console.log(num);
			primeArr.push(num)
		};
		num++;
	}
});
