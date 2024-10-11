import Room from '../classes/Room.js';
export default {
	name: 'updateMe',
	handler: (socket, io, roomId, updates) => {
		const room = Room.rooms.get(roomId);
		if (!room) return;
		const player = room.players.get(socket.id);
		if (!player) return;
		player.update(updates);
		room.update();
	}
};
