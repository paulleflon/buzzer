import { randomBytes } from 'node:crypto';

export default class Player {
	static players = new Map();
	static generateTempId() {
		return randomBytes(5).toString('hex');
	}
	constructor(socket, name) {
		this.socket = socket;
		this.id = Player.generateTempId();
		this.name = name;
		this.isPlaying = false;
		this.roomId = null;
		this.isBuzzerPressed = false;
		this.score = 0;
	}

	connect(socket) {
		this.socket = socket;
		if (this.roomId) socket.join(this.roomId);
	}

	addSocket(socket) {
		this.sockets.push(socket);
	}

	removeSocket(socket) {
		this.sockets = this.sockets.filter(s => s !== socket);
	}

	join(roomId) {
		this.roomId = roomId;
	}

	toClient() {
		return {
			id: this.id,
			socketId: this.socket.id,
			name: this.name,
			isPlaying: this.isPlaying,
			isBuzzerPressed: this.isBuzzerPressed,
			score: this.score
		};
	}
}
