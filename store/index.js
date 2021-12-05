import Vue from 'vue'
import Vuex, { Store } from 'vuex'

import * as storage from './storage';

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		gameIsOver: false,
		bot: {
			symbol: null,
			id: null,
			isHisTurn: false,
			isWinner: false
		},
		player: {
			symbol: null,
			id: null,
			isHisTurn: false,
			isWinner: false
		},
		count: {
			firstPlayer: 0,
			secondPlayer: 0
		},
		turn: {
			isFirstPlayerTurn: false,
			isSecondPlayerTurn: false
		},
		squares: [
			{ id: 1, value: "", isHighlighted: false }, 
			{ id: 2, value: "", isHighlighted: false },
			{ id: 3, value: "", isHighlighted: false },
			{ id: 4, value: "", isHighlighted: false },
			{ id: 5, value: "", isHighlighted: false },
			{ id: 6, value: "", isHighlighted: false },
			{ id: 7, value: "", isHighlighted: false },
			{ id: 8, value: "", isHighlighted: false },
			{ id: 9, value: "", isHighlighted: false },
		],
		lines: [
			[0, 4, 8],
			[2, 4, 6],
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[0, 3, 6],
			[1, 4, 7],
			[2, 5, 8]
		],
		mode: '',
	},
	actions: {
		loadGame({ state, commit, dispatch }) {
			const mode = localStorage.getItem('mode');
			if (!mode) return;
			
			switch (mode) {
				case 'single-player':
					if (state.mode) return;
					commit('initSinglePlayerOptions');
					if (state.bot.isHisTurn) {
						dispatch('botHandler');
					}
					commit('setSquaresValues');
					commit('setMode', mode);
					return;
				case 'multiplayer':
					if (state.mode) return;
					commit('initMultiplayerOptions');
					commit('setSquaresValues');
					commit('setMode', mode);
					return;
			}
		},
		//! Инициализируем глобальные настройки если они не инициолизированны до этого
		initGame({ commit, state, dispatch }, mode) {
			// if (sessionStorage.getItem('id')) {
			// 	if (localStorage.getItem('mode') === 'single-player') {
			// 		commit('initSinglePlayerOptions');
			// 	} else {
			// 		commit('initMultiplayerOptions');
			// 	}
			// 	commit('setMode', mode);
			// 	return;
			// } //! сделать функцию loadGame
			if (localStorage.getItem('mode') === 'multiplayer' && mode === 'single-player') {
				localStorage.setItem('resetOtherGames', true);
				storage.clearStorage();
			}
			if (localStorage.getItem('mode') === 'single-player' && mode === 'multiplayer') {
				storage.clearStorage();
			}
			// if (localStorage.getItem('mode') === 'single-player') {
			// 	// commit('initSinglePlayerOptions');
			// 	// if (state.bot.isHisTurn) {
			// 	// 	dispatch('botHandler');
			// 	// }
			// 	dispatch('loadGame');
			// 	commit('setMode', mode);
			// 	return;
			// 	// storage.clearStorage();
			// }

	
			// if (localStorage.getItem('mode') === 'single-player' && mode === 'multiplayer') {
			// 	debugger;
			// 	storage.clearStorage();
			// }

		
			commit('setMode', mode);
			//! if multiplayer добавляем рандомные символы и очередь
			if (!localStorage.getItem('mode')) {
				storage.initOptions(mode);
				// commit('setMode', mode);

				storage.setSymbols();
				storage.setTurn();
			}

			if (mode === 'multiplayer') {
				
				commit('initMultiplayerOptions');
			}

			if (mode === 'single-player') {
				commit('initSinglePlayerOptions');
				if (state.bot.isHisTurn) {
					dispatch('botHandler');
				}
			}

			commit('setSquaresValues');
		},
		//! Удаляем id из localStorage 
		removePlayerId({ state }) {
			switch (state.player.id) {
				case 1:
					localStorage.removeItem('firstPlayerId');
					break;
				case 2:
					localStorage.removeItem('secondPlayerId');
					break;
			}
		},
		onSquareClick({ state, commit, dispatch, getters }, index) {
			if (state.mode && localStorage.getItem('mode') && localStorage.getItem('mode') !== state.mode) {
				return;
			}

			if (state.gameIsOver) {
				storage.resetGame();
				commit('setSquaresValues');
				commit('resetHighlightedSquares');
				commit('setGameIsOver')
				if (state.bot.isHisTurn) {
					dispatch('botHandler');
					commit('setSquaresValues');
				}
				return;
			}
			if (getters.emptySquaresCount === 0) {
				dispatch('calculateWinner', 'player');
				storage.resetGame();
				commit('setSquaresValues');

				if (state.mode === 'single-player') {
					storage.updateTurn();
					commit('toggleTurn');
				}
				
				if (state.bot.isHisTurn) {
					dispatch('botHandler');
					commit('setSquaresValues');
				}
				return;
			}
			if (!state.player.isHisTurn) return;
			if (state.squares[index].value !== "") return;

			storage.updateSquaresValues(state.player.symbol, index);
			commit('setSquaresValues');

			storage.updateTurn();
			commit('toggleTurn');
			dispatch('calculateWinner', 'player');
			
			if (state.mode !== 'multiplayer' && state.bot.isHisTurn && !state.gameIsOver) {
				dispatch('botHandler');
				commit('setSquaresValues');
				dispatch('calculateWinner', 'bot');
				
			}
			
		
		}, 
		calculateWinner({ state, commit }, playerOrBot) {
			for (let index = 0; index < state.lines.length; index++) {
				const line = state.lines[index];
				const symbol = state[playerOrBot].symbol;
				const [firstIndex, secondIndex, thirdIndex] = line;
				
				const firstSquare = state.squares[firstIndex];
				const secondSqure = state.squares[secondIndex];
				const thirdSquare = state.squares[thirdIndex];
			
				if (firstSquare.value === symbol && secondSqure.value === symbol && thirdSquare.value === symbol) {	
						
					storage.updateWinner(state[playerOrBot].id);
					commit('setWinner');
					
					storage.toggleGameIsOver();
					commit('setGameIsOver');

					commit('setCount'); //! если будет проблема с setCount, НЕ ЗАБЫТЬ УДАЛИТЬ КОММЕНТАРИЙ
					storage.updateCount(state[playerOrBot].id);
					commit('setCount');

					storage.updateHighlightedSquares([firstIndex, secondIndex, thirdIndex]);
					commit('setHighlightedSquares');
					break;
				}
			}
		},
		botHandler({ state, commit }) {
			if (state.bot.isHisTurn && !state.gameIsOver) {
				const history = JSON.parse(localStorage.getItem('history'));
				const randomIndex = history.indexOf("");

				if (randomIndex !== -1) {
					// const randomIndex = Math.floor(Math.random() * emptySquares.length);
					history[randomIndex] = state.bot.symbol; 
					localStorage.setItem('history', JSON.stringify(history));
				}
				// else {
				// 	state.gameIsOver = true;
				// }
				storage.updateTurn();
				commit('toggleTurn');
			}
		},
	},
	mutations: {
		setMode(state, mode) {
			state.mode = mode;
		},
		setGameIsOver(state) {
			const gameIsOver = JSON.parse(localStorage.getItem('gameIsOver'));
			state.gameIsOver = gameIsOver;
		},
		resetHighlightedSquares(state) {
			for (let index = 0; index < state.squares.length; index++) {
				const item = state.squares[index]
				if (item.isHighlighted) {
					item.isHighlighted = false;
				}
			}
		},

		setWinner(state) {
			const winner = JSON.parse(localStorage.getItem('winner'));
			if (state.player.id === winner) {
				state.player.isWinner = true;
			}
		},
		resetPlayerTurn(state) {
			if (state.mode === 'single-player') {
				state.player.isHisTurn = false;
			}

		
		},
		setSquaresValues(state) {
			const history = JSON.parse(localStorage.getItem('history'));
			state.squares.forEach((square, index) => {
				square.value = history[index];
			});
		},

		toggleTurn(state) {

			state.player.isHisTurn = !state.player.isHisTurn;
			if (state.mode === 'single-player') {
				state.bot.isHisTurn = !state.bot.isHisTurn
			} 
			
		},


		setCount(state) {
			const count = JSON.parse(localStorage.getItem('count'));
			state.count.firstPlayer = Number(count.firstPlayer);
			state.count.secondPlayer = Number(count.secondPlayer);
		},



		setHighlightedSquares(state) {
			const highlightedSquaresIndices = JSON.parse(localStorage.getItem('highlightedSquaresIndices'));
			if (highlightedSquaresIndices.length > 0) {
				highlightedSquaresIndices.forEach(item => {
					state.squares[item].isHighlighted = true;
				});
			}
		},
		initSinglePlayerOptions(state) {
			const { firstSymbol, secondSymbol } = JSON.parse(localStorage.getItem('symbols'));
			const { isFirstPlayerTurn, isSecondPlayerTurn } = JSON.parse(localStorage.getItem('turn'));
			state.player.id = 1;
			state.player.symbol = firstSymbol;
			state.player.isHisTurn = isFirstPlayerTurn;

			state.bot.id = 2;
			state.bot.symbol = secondSymbol;
			state.bot.isHisTurn = isSecondPlayerTurn;
		},
		initMultiplayerOptions(state) {
			const { firstSymbol, secondSymbol } = JSON.parse(localStorage.getItem('symbols'));
			const { isFirstPlayerTurn, isSecondPlayerTurn } = JSON.parse(localStorage.getItem('turn'));
			if (!localStorage.getItem('firstPlayerId')) {
				storage.setPlayerId(1);
				state.player.id = 1;
				state.player.symbol = firstSymbol;
				state.player.isHisTurn = isFirstPlayerTurn || false;
			} else if (!localStorage.getItem('secondPlayerId')) {
				storage.setPlayerId(2);
				state.player.id = 2;
				state.player.symbol = secondSymbol;
				state.player.isHisTurn = isSecondPlayerTurn || false;
			} else if (localStorage.getItem('firstPlayerId') && localStorage.getItem('secondPlayerId')) {
				storage.setPlayerId(2);
				state.player.id = 2;
				state.player.symbol = secondSymbol;
				state.player.isHisTurn = isSecondPlayerTurn || false;
			}
		},

	},

	// actions: {
	// 	singlePlayerModeHandler({ commit, state }, index) {
	// 		if (state.gameIsOver) {
	// 			commit('resetGame');
	// 			return;
	// 		}

	// 		if (!state.isBotTurn && state.squares[index].value === "") {
	// 			commit('setSquareValue', { value: "X", index });
	// 			commit('toggleTurn');
	// 			commit('calculateWinner');
	// 		}

	// 		if (!state.gameIsOver) {
	// 			commit('botHandler');
	// 			commit('calculateWinner');
	// 		}
	// 	},
	// 	multiplayerModeHandler({ commit, state, getters }, index) {
	// 		if (getters.emptySquaresCount === 0) {
	// 			commit('calculateWinner');
	// 			commit('toggleGameOverOption');
	// 		}
	// 		if (state.gameIsOver) {
	// 			commit('resetGame', true);
	// 			return;
	// 		}
	// 		if (!state.multiplayer.player.isHisTurn) return;
	// 		if (state.squares[index].value !== "") return;

	// 		commit('setSquareValue', { value: state.multiplayer.player.symbol, index });

	// 		const multiplayerTurn = JSON.parse(localStorage.getItem('multiplayerTurn'));
	// 		for (let key in multiplayerTurn) {
	// 			multiplayerTurn[key] = !multiplayerTurn[key];
	// 		}
	// 		localStorage.setItem('multiplayerTurn', JSON.stringify(multiplayerTurn));
	// 		commit('toggleTurn');
	// 		commit('updateTurn');
	// 		commit('calculateWinner');
	// 	},
	// 	initMultiplayerMode({ commit }) {
	// 		if (!localStorage.getItem('mode')) {
	// 			localStorage.setItem('mode', 'multiplayer');
	// 			localStorage.setItem('history', '["", "", "", "", "", "", "", "", ""]');
	// 			localStorage.setItem('multiplayerTurn', '{"firstPlayerTurn": true, "secondPlayerTurn": false}');
	// 			localStorage.setItem('count', '{"firstPlayer": 0, "secondPlayer": 0}');
	// 			localStorage.setItem('winner', 0);
	// 			// if (!localStorage.setItem('firstPlayerId')) {
	// 			// 	localStorage.setItem('firstPlayerId', '1');
	// 			// } else {
	// 			// 	localStorage.setItem('secondPlayerId', '2');
	// 			// }
	// 			localStorage.setItem('firstPlayerId', '1');
	// 			commit('setPlayerOptions', { id: 1, count: 0, symbol: "X" });
	// 		} else {
	// 			commit('updateSquares');
	// 			commit('updateCount');
	// 			commit('updateTurn');
	// 			commit('calculateWinner');
	// 			commit('setPlayerOptions', { id: 2, count: 0, symbol: "O" });
	// 			localStorage.setItem('secondPlayerId', '2');
	// 		}

	// 		if (!localStorage.getItem('isFirstPlayerTurn')) {
	// 			localStorage.setItem('isFirstPlayerTurn', '0');
	// 		} else if (!localStorage.getItem('isSecondPlayerTurn')) {
	// 			localStorage.setItem('isSecondPlayerTurn', '1');
	// 		}
	// 	},
	// },
	getters: {
		playerId(state) {
			
			return state.player.id;
		},
		// isBotTurn(state) {
		// 	return state.isBotTurn;
		// },
		squares(state) {
			return state.squares;
		},
		emptySquaresCount(state) {
			return state.squares.filter(square => square.value === "").length;
		}
	// 	mode(state) {
	// 		return state.mode;
	// 	},
	// 	gameIsOver(state) {
	// 		return state.gameIsOver;
	// 	},
	// 	firstPlayerCount(state) {
	// 		return state.multiplayer.count.firstPlayer;
			
	// 	},
	// 	playerCount(state) {
	// 		return state.singlePlayer.playerCount;
	// 	},
	// 	secondPlayerCount(state) {
	// 		return state.multiplayer.count.secondPlayer;
	// 	},
	// 	firstPlayerTurn(state) {
	// 		return state.multiplayer.turn.firstPlayerTurn;
	// 	},
	// 	secondPlayerTurn(state) {
	// 		return state.multiplayer.turn.secondPlayerTurn;
	// 	},
	// 	playerId(state) {
	// 		return state.multiplayer.player.id;
	// 	},
	// 	botCount(state) {
	// 		return state.singlePlayer.botCount;
	// 	},
	// 	emptySquaresCount(state) {
	// 		return state.squares.filter(square => square.value === "").length;
	// 	}
	},
	// mutations: {
		// updateTurn(state) {
		// 	const turn = state.player.isHisTurn;
		// 	const storageTurn = JSON.parse(localStorage.getItem('multiplayerTurn'));
		// 	turn.firstPlayerTurn = storageTurn.firstPlayerTurn;
		// 	turn.secondPlayerTurn = storageTurn.secondPlayerTurn;
		// },
	// 	removePlayerId(state) {
	// 		if (state.multiplayer.player.id === 1) {
	// 			localStorage.removeItem('firstPlayerId');
	// 		} else {
	// 			localStorage.removeItem('secondPlayerId');
	// 		}
	// 	},
	// 	calculateWinner(state) {
	// 		for (let index = 0; index < state.lines.length; index++) {
	// 			const line = state.lines[index];
	// 			const [firstIndex, secondIndex, thirdIndex] = line;
	// 			const firstSquare = state.squares[firstIndex];
	// 			const secondSqure = state.squares[secondIndex];
	// 			const thirdSquare = state.squares[thirdIndex];

	// 			if (firstSquare.value === "X" && secondSqure.value === "X" && thirdSquare.value === "X") {
	// 				firstSquare.isHighlighted = true;
	// 				secondSqure.isHighlighted = true;
	// 				thirdSquare.isHighlighted = true;
	// 				state.gameIsOver = true;
	// 				if (state.mode === "multiplayer" && state.multiplayer.player.id == "1") {
	// 					localStorage.setItem('winner', 1);
						
	// 					const storageCount = JSON.parse(localStorage.getItem('count'));
	// 					++storageCount.firstPlayer;
	// 					localStorage.setItem('count', JSON.stringify(storageCount));

	// 					++state.multiplayer.count.firstPlayer;
	// 				}
	// 				if (state.mode === "single-player") {
	// 					++state.singlePlayer.playerCount;
	// 				}
	// 				break;
	// 			}
	// 			if (firstSquare.value === "O" && secondSqure.value === "O" && thirdSquare.value === "O") {
	// 				firstSquare.isHighlighted = true;
	// 				secondSqure.isHighlighted = true;
	// 				thirdSquare.isHighlighted = true;
	// 				state.gameIsOver = true;
	// 				if (state.mode === "multiplayer" && state.multiplayer.player.id == "2") {
	// 					localStorage.setItem('winner', 2);

	// 					const storageCount = JSON.parse(localStorage.getItem('count'));
	// 					++storageCount.secondPlayer;
	// 					localStorage.setItem('count', JSON.stringify(storageCount));

	// 					++state.multiplayer.count.secondPlayer;
	// 				}
	// 				if (state.mode === "single-player") {
	// 					++state.singlePlayer.botCount;
	// 				}
	// 				break;
	// 			}
	// 		}
	// 	},
	// 	setMode(state, mode) {
	// 		localStorage.setItem('mode', mode);
	// 		state.mode = mode; 
	// 	},
	// 	updateSquares(state) {
	// 		const history = JSON.parse(localStorage.getItem('history'));
	// 		state.squares.forEach((square, index) => {
	// 			square.value = history[index];
	// 		});
	// 	},
	// 	updateTurn(state) {
	// 		const turn = state.multiplayer.turn;
	// 		const storageTurn = JSON.parse(localStorage.getItem('multiplayerTurn'));
	// 		turn.firstPlayerTurn = storageTurn.firstPlayerTurn;
	// 		turn.secondPlayerTurn = storageTurn.secondPlayerTurn;
	// 	},
	// 	setSquareValue(state, { value, index }) {
	// 		const square = state.squares[index];
	// 		if (!square.value) {
	// 			square.value = value;
	// 			if (state.mode === 'multiplayer') {
	// 				const history = JSON.parse(localStorage.getItem('history'));
	// 				history[index] = value;
	// 				localStorage.setItem('history', JSON.stringify(history));
	// 			}
	// 		}

	// 	},
	// 	updateCount(state) {
	// 		const count = state.multiplayer.count;
	// 		const storageCount = JSON.parse(localStorage.getItem('count'));
	// 		count.firstPlayer = storageCount.firstPlayer;
	// 		count.secondPlayer = storageCount.secondPlayer;
	// 	},
	// 	botHandler(state) {
	// 		if (state.isBotTurn) {
	// 			const emptySquares = state.squares.filter(square => square.value === "");
	// 			state.isBotTurn = false;
	// 			if (emptySquares.length > 1) {
	// 				const randomIndex = Math.floor(Math.random() * emptySquares.length);
	// 				emptySquares[randomIndex].value = "O"; 
	// 			} else {
	// 				state.gameIsOver = true;
	// 			}

	// 		}
	// 	},
	// 	toggleGameOverOption(state) {
	// 		state.gameIsOver = !state.gameIsOver;
	// 	},
	// 	toggleTurn(state) {
	// 		if (state.mode === "multiplayer") {
	// 			state.multiplayer.player.isHisTurn = !state.multiplayer.player.isHisTurn;
	// 		} else if (state.mode === "single-player") {
	// 			state.isBotTurn = !state.isBotTurn;
	// 		}
			
	// 	},
	// 	resetGame(state, resetStorage) {
	// 		if (resetStorage) {
	// 			const history = JSON.parse(localStorage.getItem('history'));
	// 			history.fill("");
	// 			localStorage.setItem('history', JSON.stringify(history));
	// 			localStorage.setItem('winner', 0);
				
				
	// 		}
	// 		state.gameIsOver = false;
	// 		state.isBotTurn = false;

	// 		state.squares.forEach(square => {
	// 			square.value = "";
	// 			if (square.isHighlighted) {
	// 				square.isHighlighted = false;
	// 			}
	// 		});


	// 	},
	// 	setPlayerOptions(state, { id, count, symbol }) {
	// 		// if (sessionStorage.getItem('id')) {
	// 		// 	state.multiplayer.player.id = sessionStorage.getItem('id');
	// 		// 	state.multiplayer.player.symbol = sessionStorage.getItem('symbol');
	// 		// } else {
	// 		// 	state.multiplayer.player.id = id;
	// 		// 	state.multiplayer.player.symbol = symbol;
	// 		// 	sessionStorage.setItem('id', id);
	// 		// 	sessionStorage.setItem('symbol', symbol);
	// 		// }

	// 		// const turn = JSON.parse(localStorage.getItem('multiplayerTurn'));
	// 		// if (state.multiplayer.player.id === 1) {
				
	// 		// 	state.multiplayer.player.isHisTurn = turn.firstPlayerTurn;
	// 		// }
	// 		// if (state.multiplayer.player.id === 2) {
	// 		// 	state.multiplayer.player.isHisTurn = turn.secondPlayerTurn;
	// 		// }
	// 	}
	// },
});
