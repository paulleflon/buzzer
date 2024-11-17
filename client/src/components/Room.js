import { useEffect, useRef, useState } from 'react';
import { socket } from '../lib/socket';
import '../styles/Room.css';
import Buzzer from '../assets/buzzer.png';
import BuzzerPressed from '../assets/buzzer_pressed.png';
import BuzzerAudio from '../assets/buzzer.mp3';
import WrongAudio from '../assets/wrong.mp3';
import ExpiredSound from '../assets/expired.mp3';
import PointsSound from '../assets/points.mp3';

export default function Room({ room, setRoom, playerId }) {
	const player = room.players.find(player => player.id === playerId);
	const [lastMessage, setLastMessage] = useState(room.message || '');
	const [buzzAudio] = useState(new Audio(BuzzerAudio));
	const [wrongAudio] = useState(new Audio(WrongAudio));
	const [expiredAudio] = useState(new Audio(ExpiredSound));
	const [pointsAudio] = useState(new Audio(PointsSound));
	const [otherSocket, setOtherSocket] = useState(false);
	const container = useRef(null);

	useEffect(() => {
		console.log('bind');
		socket.on('updateRoom', updatedRoom => {
			console.log('wsh');
			setRoom(updatedRoom);
			if (updatedRoom.message && updatedRoom.message !== lastMessage) {
				setLastMessage(updatedRoom.message);
			}
			container.current.focus();
		});
		socket.on('buzz', () => {
			buzzAudio.currentTime = 0;
			buzzAudio.play();
		});
		socket.on('playWrongSound', () => {
			wrongAudio.currentTime = 0;
			wrongAudio.play();
		});
		socket.on('playExpiredSound', () => {
			expiredAudio.currentTime = 0;
			expiredAudio.play();
		});
		socket.on('playPointsSound', () => {
			pointsAudio.currentTime = 0;
			pointsAudio.play();
		});
		socket.on('connectedToOtherSocket', () => {
			setOtherSocket(true);
		}, []);
		return () => {
			console.log('offed');
			socket.off('updateRoom');
			socket.off('buzz');
			socket.off('playWrongSound');
			socket.off('playExpiredSound');
			socket.off('playPointsSound');
			socket.off('connectedToOtherSocket');
		};
	});

	const buzz = () => {
		console.log(socket);
		if (player.isPlaying && !room.currentBuzz)
			socket.emit('pressBuzzer', room.id);
	};

	const keyDown = e => {
		if (e.key === ' ') buzz();
	};

	return (
		<>
			<div className={`other-socket ${otherSocket ? 'visible' : ''}`}>
				<h1>You are connected with another client.</h1>
				<p>You can now close this tab and play from your new client.</p>
			</div>
			<div className="top-bar">
				<div className="room-code">
					<div className="room-code-cta">Hover to reveal code</div>
					<div className="room-code-hidden">{room.id}</div>
				</div>
				<HostControls player={player} room={room} />
				{player.isPlaying ? (
					<button
						className="play-button"
						onClick={() =>
							socket.emit('updateMe', room.id, {
								isPlaying: false
							})
						}
					>
						Spectate
					</button>
				) : (
					<button
						className="play-button"
						onClick={() =>
							socket.emit('updateMe', room.id, {
								isPlaying: true
							})
						}
					>
						Join game
					</button>
				)}
			</div>
			<div
				className="game-container"
				ref={container}
				tabIndex={0}
				onKeyDown={keyDown}
			>
				{player.isPlaying ? (
					<div
						className="buzzer-container"
						onClick={buzz}
						data-disabled={room.pressedThisRound.includes(
							socket.clientId
						)}
					>
						{room.currentBuzz === socket.clientId ? (
							<img src={BuzzerPressed} alt="buzzer" />
						) : (
							<img src={Buzzer} alt="buzzer" />
						)}
					</div>
				) : (
					<div className="spectating">You are spectating</div>
				)}
				<div
					className={
						'room-message' + (room.message ? ' visible' : '')
					}
				>
					{lastMessage}
				</div>
			</div>
			<div className="bottom-row">
				{room.players.map(player => (
					<PlayerCard key={player.id} player={player} room={room} />
				))}
			</div>
		</>
	);
}

function HostControls({ player, room }) {
	const nextRound = () => {
		if (
			room.pressedThisRound.length === room.players.length ||
			window.confirm('Are you sure you want to start the next round?')
		)
			socket.emit('updateRoom', room.id, {
				currentBuzz: null,
				roundPaused: false,
				pressedThisRound: [],
				message: ''
			});
	};
	const togglePause = () => {
		if (room.roundPaused)
			socket.emit('updateRoom', room.id, {
				roundPaused: false,
				message: ''
			});
		else
			socket.emit('updateRoom', room.id, {
				roundPaused: true,
				message: 'Round Paused'
			});
	};

	const givePoints = points => {
		const playerId = room.currentBuzz;
		const player = room.players.find(player => player.id === playerId);
		if (!player) return;
		socket.emit('updatePlayer', room.id, playerId, {
			score: player.score + points
		});
		socket.emit('updateRoom', room.id, {
			currentBuzz: null,
			roundPaused: false,
			message: ''
		});
	};

	const wrongAnswer = () => {
		socket.emit('updateRoom', room.id, {
			currentBuzz: null,
			roundPaused: true,
			pressedThisRound: [],
			message: ''
		});
	};

	if (player.id !== room.host) return null;
	return (
		<div className="host-controls">
			{room.currentBuzz && (
				<>
					<button onClick={() => givePoints(1)}>+1</button>
					<button onClick={() => givePoints(2)}>+2</button>
					<button onClick={() => givePoints(3)}>+3</button>
					<button onClick={wrongAnswer}>Wrong answer</button>
				</>
			)}
			{!room.currentBuzz && (
				<>
					<button
						onClick={togglePause}
						disabled={room.currentBuzz}
						className="pause-button"
					>
						{room.roundPaused ? 'Resume' : 'Pause'}
					</button>
				</>
			)}
			<button onClick={nextRound}>Next Round</button>
		</div>
	);
}

function PlayerCard({ player, room }) {
	let className = '';
	if (!player.isPlaying) className = 'spectator';
	else if (room.currentBuzz === player.id) className = 'current-buzz';
	else if (room.roundPaused) className = 'round-paused';
	else if (room.pressedThisRound.includes(player.id))
		className = 'pressed-this-round';
	if (room.host === player.id) className += ' host';

	return (
		<div className={'player-card ' + className}>
			{player.isPlaying && (
				<div className="player-score">{player.score}</div>
			)}
			<div
				className="player-buzzer"
				onClick={() => {
					socket.emit('pressBuzzer', room.id);
				}}
			>
				{room.currentBuzz === player.id ? (
					<img src={BuzzerPressed} alt="buzzer" />
				) : (
					<img src={Buzzer} alt="buzzer" />
				)}
			</div>
			{player.name}
		</div>
	);
}
