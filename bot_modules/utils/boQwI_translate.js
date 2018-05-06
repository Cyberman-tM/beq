/*

  Translation functions for the various boQwI' types (like word types)

*/

//Check if the word is actually a derived definition
module.exports.isDerived = function (wType)
{
	if (wType.indexOf("deriv") != -1)
		return true;
	else
		return false;
}
