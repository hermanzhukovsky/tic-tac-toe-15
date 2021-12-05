import { shuffle } from './helpers';

export const toggleGameIsOver = () => {
	let gameIsOver = JSON.parse(localStorage.getItem('gameIsOver'));
	localStorage.setItem('gameIsOver', !gameIsOver);
}

export const updateWinner = id => {
	localStorage.setItem('winner', id);
}

export const updateSquaresValues = (value, index) => {
	const history = JSON.parse(localStorage.getItem('history'));

	if (history[index]) return;

	history[index] = value;
	localStorage.setItem('history', JSON.stringify(history));

}

export const updateTurn = () => {
	const turn = JSON.parse(localStorage.getItem('turn'));
	turn.isFirstPlayerTurn = !turn.isFirstPlayerTurn;
	turn.isSecondPlayerTurn = !turn.isSecondPlayerTurn;
	localStorage.setItem('turn', JSON.stringify(turn));
}

export const updateCount = id => {
	const count = JSON.parse(localStorage.getItem('count'));
	switch (id) {
		case 1:
			count.firstPlayer = Number(count.firstPlayer) + 1;
			break;
		case 2:
			count.secondPlayer = Number(count.secondPlayer) + 1;
			break;
	}
	localStorage.setItem('count', JSON.stringify(count));
}

export const updateHighlightedSquares = indices => {
	localStorage.setItem('highlightedSquaresIndices', JSON.stringify(indices));
}

export const setPlayerId = id => {
	switch (id) {
		case 1:
			localStorage.setItem('firstPlayerId', id);
			break;
		case 2:
			localStorage.setItem('secondPlayerId', id);
			break;
	}
}

export const initOptions = (mode) => {
	localStorage.setItem('gameIsOver', false);
	localStorage.setItem('history', '["", "", "", "", "", "", "", "", ""]');
	localStorage.setItem('mode', mode);
	localStorage.setItem('count', '{ "firstPlayer": "0", "secondPlayer": "0" }');
	localStorage.setItem('winner', '0');
	localStorage.setItem('highlightedSquaresIndices', '[]');
	localStorage.setItem('resetGame', false);
}

export const setSymbols = () => {
	const [firstSymbol, secondSymbol] = shuffle(['X', 'O']);
	localStorage.setItem('symbols', `{ "firstSymbol": "${firstSymbol}", "secondSymbol": "${secondSymbol}"}`);
}

export const setTurn = () => {
	const [isFirstPlayerTurn, isSecondPlayerTurn] = shuffle([true, false]);
	localStorage.setItem(
		'turn', 
		`{ "isFirstPlayerTurn": ${isFirstPlayerTurn}, "isSecondPlayerTurn": ${isSecondPlayerTurn}}`
	);
}

export const resetGame = () => {
	const history = JSON.parse(localStorage.getItem('history'));
	history.fill("");
	localStorage.setItem('history', JSON.stringify(history));
	localStorage.setItem('winner', 0);
	localStorage.setItem('highlightedSquaresIndices', '[]');
	localStorage.setItem('gameIsOver', false);
	localStorage.setItem('resetGame', true);
}

export const clearStorage = () => {
	localStorage.clear();
}
