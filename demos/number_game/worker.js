var result = {
	numbers: [],
	iterations: 0,
	permutations: 0
};
var start = Date.now();

function testNum(num) {
	var test = num;
	if (test % 9 == 0) {
		test = Math.floor(test / 10);
		if (test % 8 == 0) {
			test = Math.floor(test / 10);
			if (test % 7 == 0) {
				test = Math.floor(test / 10);
				if (test % 6 == 0) {
					test = Math.floor(test / 10);
					if (test % 5 == 0) {
						test = Math.floor(test / 10);
						if (test % 4 == 0) {
							test = Math.floor(test / 10);
							if (test % 3 == 0) {
								test = Math.floor(test / 10);
								if (test % 2 == 0) {
									result.numbers.push({
										ans: num,
										time: Date.now() - start
									});
									postMessage(result);
								}
							}
						}
					}
				}
			}
		}
	}
}

function genNums() {
	for (var i1 = 1; i1 < 10; i1++) {
		result.iterations++;
		result.permutations++;
		var num1 = "" + i1;
		for (var i2 = 1; i2 < 10; i2++) {
			result.iterations++;
			if (num1.indexOf(i2) == -1) {
				result.permutations++;
				var num2 = num1 + i2;
				for (var i3 = 1; i3 < 10; i3++) {
					result.iterations++;
					if (num2.indexOf(i3) == -1) {
						result.permutations++;
						var num3 = num2 + i3;
						for (var i4 = 1; i4 < 10; i4++) {
							result.iterations++;
							if (num3.indexOf(i4) == -1) {
								result.permutations++;
								var num4 = num3 + i4;
								for (var i5 = 1; i5 < 10; i5++) {
									result.iterations++;
									if (num4.indexOf(i5) == -1) {
										result.permutations++;
										var num5 = num4 + i5;
										for (var i6 = 1; i6 < 10; i6++) {
											result.iterations++;
											if (num5.indexOf(i6) == -1) {
												result.permutations++;
												var num6 = num5 + i6;
												for (var i7 = 1; i7 < 10; i7++) {
													result.iterations++;
													if (num6.indexOf(i7) == -1) {
														result.permutations++;
														var num7 = num6 + i7;
														for (var i8 = 1; i8 < 10; i8++) {
															result.iterations++;
															if (num7.indexOf(i8) == -1) {
																result.permutations++;
																var num8 = num7 + i8;
																for (var i9 = 1; i9 < 10; i9++) {
																	result.iterations++;
																	if (num8.indexOf(i9) == -1) {
																		result.permutations++;
																		var num9 = num8 + i9;
																		testNum(num9);
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
				postMessage(result);
			}
		}
	}
	postMessage(result);
}
genNums();
