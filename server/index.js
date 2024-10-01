import {Server} from 'socket.io';
import Room from './Room.js';
import Player from './Player.js';

const io = new Server({
	cors: {
		origin: 'http://localhost:3000'
	}
});

export const ROOMS = {};
export const PLAYERS = {};

io.listen(process.env.PORT || 4000);


io.on('connection', (socket) => {
	const id = socket.handshake.query.clientId;
	if (!id)
		return socket.disconnect();
	socket.clientId = id;
	let player = PLAYERS[id];
	if (player) {
		PLAYERS[id].addSocket(socket);
	} else {
		console.log('New player:', id);
			player = new Player(socket, id);
		PLAYERS[id] = player;
	}

	socket.on('disconnect', () => {
		console.log('disconnect', player.sockets.map(s => s.id));
		if (!player.room) 
			return;
		player.removeSocket(socket);
		if (player.sockets.length === 0) {
			const room = ROOMS[player.room];
			room.players = room.players.filter(p => p !== player.id);
			if (room.players.length === 0) {
				delete ROOMS[player.room];
				console.log('Room deleted:', player.room);
			}
			else
				io.to(player.room).emit('updateRoom', room.toClient());
		}
	});
	
	socket.on('newRoom', (name, callback) => {
		const room = new Room(player);
		player.name = name;
		player.room = room.id;
		ROOMS[room.id] = room;
		console.log('Room created:', room.id);
		socket.join(room.id);
		callback({room: room.toClient()});
	});

	socket.on('joinRoom', (name, roomId, callback) => {
		const room = ROOMS[roomId];
		player.name = name;
		console.log(ROOMS);
		if (!room) {
			return callback({error: 'Room not found'});
		}
		if (!room.players.includes(player.id))
			room.players.push(player.id);
		console.log('Room joined:', room.id);
		socket.join(room.id);
		player.room = room.id;
		io.to(room.id).emit('updateRoom', room.toClient());
		callback({room: room.toClient()});
	});

	socket.on('buzz', () => {
		if (!player.room)
			return;
		const room = ROOMS[player.room];
		if (room.roundPaused)
			return;
		if (room.pressedThisRound.includes(player.id))
			return;
		room.roundPaused = true;
		room.pressedThisRound.push(player.id);
		room.currentBuzz = player.id;
		room.message = `${player.name} buzzed first!`;
		io.to(player.room).emit('updateRoom', room.toClient());
		io.to(player.room).emit('buzz');
	});

	socket.on('continueRound', () => {
		if (!player.room || player.id !== ROOMS[player.room].host)
			return;
		const room = ROOMS[player.room];
		room.roundPaused = false;
		room.currentBuzz = null;
		room.message = null;
		io.to(player.room).emit('updateRoom', room.toClient());
	});
	socket.on('nextRound', () => {
		if (!player.room || player.id !== ROOMS[player.room].host)
			return;
		const room = ROOMS[player.room];
		room.roundPaused = false;
		room.pressedThisRound = [];
		room.currentBuzz = null;
		room.message = null;
		io.to(player.room).emit('updateRoom', room.toClient());
	});

	socket.on('pause', () => {
		if (!player.room || player.id !== ROOMS[player.room].host)
			return;
		const room = ROOMS[player.room];
		room.roundPaused = true;
		room.message = 'Round paused';
		io.to(player.room).emit('updateRoom', room.toClient());
	});
	socket.on('unpause', () => {
		if (!player.room || player.id !== ROOMS[player.room].host)
			return;
		const room = ROOMS[player.room];
		room.roundPaused = false;
		room.message = null;
		io.to(player.room).emit('updateRoom', room.toClient());
	});


});