export default class Player {
	constructor(socket, id) {
		this.sockets = [socket];
		this.id = id;
		this.name = null;
		this.isPlaying = false;
		this.room = null;
		this.isBuzzerPressed = false;
		this.score = 0;
	}

	addSocket(socket) {
		this.sockets.push(socket);
	}

	removeSocket(socket) {
		this.sockets = this.sockets.filter(s => s !== socket);
	}

	toClient() {
		return {
			id: this.id,
			name: this.name,
			isPlaying: this.isPlaying,
			isBuzzerPressed: this.isBuzzerPressed,
			score: this.score
		}
	}
}