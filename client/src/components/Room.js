import {useEffect, useRef, useState} from 'react';
import { socket } from '../lib/socket';
import '../styles/Room.css';
import Buzzer from '../assets/buzzer.png';
import BuzzerPressed from '../assets/buzzer_pressed.png';
import BuzzerAudio from '../assets/buzzer.mp3';
import WrongAudio from '../assets/wrong.mp3';
import ExpiredSound from '../assets/expired.mp3';
import PointsSound from '../assets/points.mp3';

export default function Room({ room, setRoom }) {
	const player = room.players.find(player => player.id === socket.clientId);
	const [lastMessage, setLastMessage] = useState('');
	const [buzzAudio] = useState(new Audio(BuzzerAudio));
	const [wrongAudio] = useState(new Audio(WrongAudio));
	const [expiredAudio] = useState(new Audio(ExpiredSound));
	const [pointsAudio] = useState(new Audio(PointsSound));
	const container = useRef(null);

	useEffect(() => {
		socket.on('updateRoom', (updatedRoom) => {
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
		return () => {
			socket.off('updateRoom');
			socket.off('buzz');
			socket.off('playWrongSound');
			socket.off('playExpiredSound');
			socket.off('playPointsSound');
		}
	});

	const buzz = () => {
		if (player.isPlaying && !room.currentBuzz)
			socket.emit('buzz');
	}

	const keyDown = (e) => {
		if (e.key === ' ')
			buzz();
	};

	return (
		<>
		<div className='top-bar'>
			<div className='room-code'>
				<div className='room-code-cta'>Hover to reveal code</div>
				<div className='room-code-hidden'>{room.id}</div>
			</div>
			<HostControls player={room.players.find(player => socket.clientId === player.id)} room={room} />
			{
				room.players.find(player => player.id === socket.clientId).isPlaying ?
				<button className='play-button' onClick={() => socket.emit('notPlaying')}>Spectate</button> :
				<button className='play-button' onClick={() => socket.emit('playing')}>Join game</button>
			}
			</div>
			<div 
				className='game-container' 
				ref={container}
				tabIndex={0}
				onKeyDown={keyDown}
			>
				{player.isPlaying ? 
					<div className='buzzer-container' onClick={buzz}>
						{room.currentBuzz === socket.clientId ? <img src={BuzzerPressed} alt='buzzer' /> : <img src={Buzzer} alt='buzzer' />}
					</div>
				:
				<div className='spectating'>
					You are spectating
				</div>
				}
				<div 
					className={'room-message' + (room.message ? ' visible' : '')}
				>
					{lastMessage}
				</div>
			</div>
			<div className='bottom-row'>
				{room.players.map(player => <PlayerCard key={player.id} player={player} room={room} />)}
			</div>
		</>
	)
};

function HostControls({ player, room }) {
	const continueRound = () => {
		socket.emit('continueRound');
	}
	const nextRound = () => {
		socket.emit('nextRound');
	}
	const togglePause = () => {
		if (room.roundPaused)
			socket.emit('unpause');
		else
			socket.emit('pause');
	}

	const givePoints = (points) => {
		const playerId = room.currentBuzz;
		socket.emit('givePoints', playerId, points);
	}

	const wrongAnswer = () => {
		socket.emit('continueRound', true);
	}

	if (player.id !== room.host)
		return null;
	return (
		<div className='host-controls'>
		{
			room.currentBuzz &&
			<>
				<button onClick={() => givePoints(1)}>+1</button>
				<button onClick={() => givePoints(2)}>+2</button>
				<button onClick={() => givePoints(3)}>+3</button>
				<button onClick={wrongAnswer}>Wrong answer</button>
			</>
		}
		{ !room.currentBuzz  &&
			<>
				<button 
					onClick={togglePause}
					disabled={room.currentBuzz}
					className='pause-button'
				>
					{room.roundPaused ? 'Resume' : 'Pause'}
				</button>
				<button 
					onClick={continueRound}
					disabled={room.pressedThisRound.length === room.players.filter(p => p.isPlaying).length || !room.currentBuzz}
				>
					Continue Round
				</button>
			</>
		}
			<button onClick={nextRound}>Next Round</button>
		</div>
	)
}

function PlayerCard({ player, room }) {
	let className = '';
	if (!player.isPlaying)
		className = 'spectator';
	else if (room.currentBuzz === player.id)
		className = 'current-buzz';
	else if (room.roundPaused)
		className = 'round-paused';
	else if (room.pressedThisRound.includes(player.id))
		className = 'pressed-this-round';
	if (room.host === player.id)
		className += ' host';

	return (
		<div className={'player-card ' + className}>
			{player.isPlaying && <div className='player-score'>{player.score}</div>}
			<div className='player-buzzer'
				onClick={() => {
					socket.emit('pressBuzzer', room.id);
				}
			}>
				{room.currentBuzz === player.id ? <img src={BuzzerPressed} alt='buzzer' /> : <img src={Buzzer} alt='buzzer' />}
			</div>
			{player.name}
		</div>
	)
}