export const addZero = (i) => {
	if (i < 10) {
		i = `0${i}`;
	}
	return i;
};

export default addZero;
