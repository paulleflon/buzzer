import Room from '../classes/Room.js';
export default {
	name: 'pressBuzzer',
	handler: (socket, io, roomId) => {
		const room = Room.rooms.get(roomId);
		if (!room || room.roundPaused || room.currentBuzz) return;
		const player = room.players.get(socket.id);
		if (!player) return;
		if (room.pressedThisRound.includes(player.id)) return;
		room.update({
			pressedThisRound: [...room.pressedThisRound, player.id],
			currentBuzz: player.id,
			message: `${player.name} buzzed in!`
		});
	}
};
