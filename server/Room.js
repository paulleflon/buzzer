import { PLAYERS } from './index.js';

const id = () => Array.from({ length: 4 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');


class Room {
	constructor(host) {
		this.id = id();
		this.host = host.id;
		this.players = [host.id];
		this.roundPaused = true;
		this.pressedThisRound = [];
		this.currentBuzz = null;
		this.message = 'Waiting for host to start a round...';
	}

	getPlayersList() {
		const players = this.players.map(playerId => PLAYERS[playerId].toClient());
		return players;
	}

	toClient() {
		return {
			id: this.id,
			host: this.host,
			players: this.getPlayersList(),
			roundPaused: this.roundPaused,
			pressedThisRound: this.pressedThisRound,
			currentBuzz: this.currentBuzz,
			message: this.message
		}
	}

}

export default Room;