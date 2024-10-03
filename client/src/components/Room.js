import {useEffect, useRef, useState} from 'react';
import { socket } from '../lib/socket';
import '../styles/Room.css';
import Buzzer from '../assets/buzzer.png';
import BuzzerPressed from '../assets/buzzer_pressed.png';
import BuzzerAudio from '../assets/buzzer.mp3';

export default function Room({ room, setRoom }) {
	const player = room.players.find(player => player.id === socket.clientId);
	const [lastMessage, setLastMessage] = useState('');
	const [audio] = useState(new Audio(BuzzerAudio));
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
			audio.currentTime = 0;
			audio.play();
		});
		return () => socket.off('updateRoom');
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
	if (player.id !== room.host)
		return null;
	return (
		<div className='host-controls'>
			<button 
				onClick={togglePause}
				disabled={room.currentBuzz}
				className='pause-button'
			>
				{room.roundPaused ? 'Resume' : 'Pause'}
			</button>
			<button 
				onClick={continueRound}
				disabled={room.pressedThisRound.length === room.players.length || !room.currentBuzz}
			>
				Continue Round

			</button>
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