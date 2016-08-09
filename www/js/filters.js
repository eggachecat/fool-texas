angular.module('texas.filters', [])
.filter("fooCurrency", function(){
	return function (input) {

		var lenMap = {
			"1": "",
			"2": "k",
			"3": "M",
			"4": "B"
		}
		var inputArr = input.split(",")
		var len = inputArr.length

		return inputArr[0] + lenMap[len];
	}
})
