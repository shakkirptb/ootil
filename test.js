
var util = require("./index.js");

var myArray = [1,2,2,3,3,4];
var actual = myArray.unique();
var expected=[1,2,3];
var result=true;
for(var i=0;i < actual.length;i++){
	if(actual[i]!=expected[i]){
		result=false;
		break;
	}
}
console.assert(result,"unique() failed")