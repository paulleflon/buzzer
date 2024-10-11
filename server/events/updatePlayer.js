import Room from '../classes/Room.js';

export default {
	name: 'updatePlayer',
	handler: (socket, io, roomId, playerId, updates) => {
		const room = Room.rooms.get(roomId);
		if (!room) return;
		const player = room.getPlayerById(playerId);
		const requester = room.players.get(socket.id);
		if (!player || !requester || requester.id !== room.hostId) return;
		player.update(updates);
		room.update();
	}
};
