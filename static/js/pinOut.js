var socket = new WebSocket ('ws://10.27.30.24:8765');
socket.onopen = function(event) {
	socket.send('new client');
}
socket.onclose = function(event){
//	console.log('The socket has been closed', event);
}

function pinToggle(pin) {
	socket.send(pin);
}
