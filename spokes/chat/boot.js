// CHATROOM APPLICATION

var chat = new_spokes_application();

chat.db.create({
		host: '/',
		port: '8080',
		adapter: 'websocket'
});


chat.config.defaults = {
	handle_color: 'DarkRed',
	text_color: 'Black',
	font: 'Helvetica'
};