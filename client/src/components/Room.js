import {useEffect, useState} from 'react';
import { socket } from '../lib/socket';
import '../styles/Room.css';
import Buzzer from '../assets/buzzer.png';
import BuzzerPressed from '../assets/buzzer_pressed.png';
import BuzzerAudio from '../assets/buzzer.mp3';

export default function Room({ room, setRoom }) {
	const [audio] = useState(new Audio(BuzzerAudio));

	useEffect(() => {
		socket.on('updateRoom', setRoom);
		socket.on('buzz', () => {
			audio.currentTime = 0;
			audio.play();
		});
		return () => socket.off('updateRoom');
	});

	const buzz = () => {
		socket.emit('buzz');
	}
	return (
		<div>
			<h1>Room: {room.id}</h1>
			{JSON.stringify(room)}
			<HostControls player={room.players.find(player => socket.clientId === player.id)} room={room} />
			{
				room.players.find(player => player.id === socket.clientId).isPlaying ?
				<button onClick={() => socket.emit('notPlaying')}>Spectate</button> :
				<button onClick={() => socket.emit('playing')}>Join room</button>
			}
			<div className='buzzer-container' onClick={buzz}>
				{room.message && <div className='room-message'>{room.message}</div>}
				{room.currentBuzz === socket.clientId ? <img src={BuzzerPressed} alt='buzzer' /> : <img src={Buzzer} alt='buzzer' />}
			</div>
			<div>
				{room.players.map(player => <PlayerCard key={player.id} player={player} room={room} />)}
			</div>
		</div>
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