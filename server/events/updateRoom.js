import Room from '../classes/Room.js';

export default {
	name: 'updateRoom',
	handler: (socket, io, roomId, edits) => {
		const room = Room.rooms.get(roomId);
		if (!room) return;
		const player = room.players.get(socket.id);
		if (!player || player.id !== room.hostId) return;
		room.update(edits);
	}
};
