import Player from '../classes/Player.js';
import Room from '../classes/Room.js';

export default {
	name: 'createRoom',
	handler: (socket, io, name, callback) => {
		const player = new Player(socket, name);
		const room = new Room(io, player);
		Room.rooms.set(room.id, room);
		socket.join(room.id);
		callback(player.id, room.toClient());
	}
};
