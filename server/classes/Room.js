const id = () =>
	Array.from({ length: 4 }, () =>
		String.fromCharCode(65 + Math.floor(Math.random() * 26))
	).join('');

class Room {
	static rooms = new Map();
	constructor(io, host) {
		this.io = io;
		this.id = id();
		this.hostId = host.id;
		this.players = new Map();
		this.players.set(host.socket.id, host);
		this.roundPaused = true;
		this.pressedThisRound = [];
		this.currentBuzz = null;
		this.message = 'Waiting for host to start a round...';
	}

	getPlayerById(id) {
		return this.players.values().find(p => p.id === id);
	}

	addPlayer(player) {
		this.players.set(player.id, player);
	}

	update(updates) {
		if (updates) {
			Object.keys(updates).forEach(key => {
				this[key] = updates[key];
			});
		}
		this.io.to(this.id).emit('updateRoom', this.toClient());
	}

	toClient() {
		const players = this.players.values().map(p => p.toClient());
		return {
			id: this.id,
			host: this.hostId,
			players: Array.from(players),
			roundPaused: this.roundPaused,
			pressedThisRound: this.pressedThisRound,
			currentBuzz: this.currentBuzz,
			message: this.message
		};
	}
}

export default Room;
