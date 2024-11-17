/* eslint-disable react-hooks/rules-of-hooks */
import React, { useCallback, useEffect, useState } from 'react';
import HomePage from './components/HomePage';
import Room from './components/Room';
import { socket } from './lib/socket';
import useTempId from './lib/useTempId';
import './styles/App.css';

const validateHash = hash => {
	const upperHash = hash.slice(1).toUpperCase();
	if (/^[A-Z]{4}$/.test(upperHash)) {
		window.location.hash = upperHash; // Normalize hash to uppercase
		return upperHash;
	} else {
		window.location.hash = ''; // Clear invalid hash from the URL
		return null;
	}
};

export default function App() {
	const [username, setUsername] = useState(
		localStorage.getItem('username') || ''
	);
	const [roomId, setRoomId] = useState(() =>
		validateHash(window.location.hash)
	);
	const [room, setRoom] = useState(null);
	const [joinError, setJoinError] = useState('');
	const [createError] = useState('');
	const [usernameError, setUsernameError] = useState(false);
	const [playerId, setPlayerId] = useState();

	const createRoom = () => {
		if (!username) {
			setUsernameError(true);
			return;
		} else setUsernameError(false);
		socket.emit('createRoom', username, (playerId, room) => {
			setPlayerId(useTempId(room.id, playerId));
			localStorage.setItem(`id_room_${room.id}`, playerId);
			window.location.hash = room.id;
			setRoom(room);
		});
	};

	const joinRoom = useCallback(
		code => {
			console.log('JOIN ROOM FUNCTION');
			if (!username) {
				setUsernameError(true);
				return;
			} else setUsernameError(false);
			if (!code) {
				setJoinError('Please enter a room code');
				return;
			} else setJoinError('');

			const tempId = useTempId(code);
			socket.emit(
				'joinRoom',
				username,
				code,
				tempId,
				({ room, error, pId }) => {
					if (error) {
						setJoinError(error);
						window.location.hash = '';
					} else {
						window.location.hash = code;
						setRoom(room);
						setPlayerId(useTempId(code, pId));
					}
				}
			);
		},
		[setUsernameError, setJoinError, setRoom, username]
	);

	useEffect(() => {
		if (roomId && !room) joinRoom(roomId);

		const onHashChange = () => {
			const hash = validateHash(window.location.hash);
			setRoomId(hash);
			if (!hash) {
				setRoom(null);
				socket.emit('leaveRoom');
			}
		};
		window.addEventListener('hashchange', onHashChange);
		return () => {
			window.removeEventListener('hashchange', onHashChange);
		};
	}, [roomId, joinRoom]);
	if (!room) {
		return (
			<div className="App">
				<HomePage
					username={username}
					setUsername={setUsername}
					onJoin={joinRoom}
					onCreate={createRoom}
					joinError={joinError}
					createError={createError}
					usernameError={usernameError}
				/>
			</div>
		);
	} else {
		return (
			<div className="App">
				<Room room={room} setRoom={setRoom} playerId={playerId} />
			</div>
		);
	}
}
