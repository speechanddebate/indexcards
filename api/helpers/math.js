
// I cannot believe there isn't a built in internal to do this.
export const addDecimals = (arr) => {
	let total = 0;
	arr.forEach( (n) => {
		total += Math.round( n * 100 );
	});
	return parseFloat( (total / 100 ).toFixed(2) );
};