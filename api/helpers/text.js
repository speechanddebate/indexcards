export const addZero = (i) => {
	if (i < 10) {
		i = `0${i}`;
	}
	return i;
};

export const ucfirst = (lowered) => {
	return String(lowered).charAt(0).toUpperCase() + String(lowered).slice(1);
};

export default addZero;
