export const shuffle = (array) => {
	let currentIndex = array.length,
		randomIndex,
		tempraryValue;

	while (currentIndex !== 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		tempraryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = tempraryValue;
	}
	return array;
}