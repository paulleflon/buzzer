import { io } from 'socket.io-client';

let clientId = localStorage.getItem('clientId');
if (!clientId) {
	localStorage.setItem('clientId', Math.random().toString(36).slice(2));
	clientId = localStorage.getItem('clientId');
}


// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:4000';

export const socket = io(URL, {
	query: {clientId}
});
console.log(socket);
socket.clientId = clientId;