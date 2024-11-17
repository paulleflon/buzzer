import Player from '../classes/Player.js';
import Room from '../classes/Room.js';

export default {
	name: 'joinRoom',
	handler: (socket, io, name, code, tempId, callback) => {
		const room = Room.rooms.get(code);
		if (!room) {
			callback({ error: 'Room not found' });
			return;
		}
		let player = room.getPlayerById(tempId);
		if (player) {
			player.connect(socket);
		} else {
			player = new Player(socket, name);
			room.addPlayer(player);
			socket.join(room.id);
		}
		callback({ room: room.toClient(), pId: player.id });
	}
};
