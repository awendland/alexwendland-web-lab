var Prime = (function() {
    var m = {};
    
    m.getPrimes = function(onPrime) {
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
                if (onPrime)
                    onPrime(num);
                primeArr.push(num)
            };
            num++;
        }
    };
    
    return m;
})();

$(function() {
    var pre = $('#prime-pre');
	Prime.getPrimes(function(prime) {
        console.log(prime);
        pre.text(pre.text() + prime + "\n");
    });
});