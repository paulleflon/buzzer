import { useState } from 'react';

export default function HomePage({
	username, 
	setUsername, 
	onJoin, 
	onCreate,
	joinError,
	createError,
	usernameError
}) {
	const [roomCode, setRoomCode] = useState('');

	const onCodeChange = e => {
		let code = e.target.value;
		code = code.toUpperCase().replace(/[^A-Z]/g, '');
		code = code.slice(0, 4);
		console.log(code);
		setRoomCode(code);
	}

	const onUsernameChange = e => {
		let value = e.target.value;
		value = value.slice(0, 25);  // Limit username length to 20 characters
		setUsername(value);
		localStorage.setItem('username', value);
	}

	return (
		<div className='HomePage'>
			<h1>Welcome to Buzzer!</h1>
			{usernameError && <p className='error'>Please enter a username</p>}
			<input
				type='text'
				value={username}
				onChange={onUsernameChange}
				placeholder='Enter your name'
			/>
			<div className='room-selection'>
				<div className='create-room'>
					<h2>Create a room</h2>
					{createError && <p className='error'>{createError}</p>}
					<button onClick={onCreate}>
						Let's go
					</button>
				</div>
				<div className='join-room'>
					<h2>Join a room</h2>
					{joinError && <p className='error'>{joinError}</p>}
					<input 
						type='text' 
						placeholder='Enter room code' 
						value={roomCode}
						onChange={onCodeChange}
					/>
					<button onClick={() => onJoin(roomCode)}>Join</button>
				</div>
			</div>
		</div>
	);
}