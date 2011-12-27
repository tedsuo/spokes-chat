var http = require('http'), 
		io = require('./lib/Socket.IO-node/lib/socket.io'),
		sys = require('sys'),

chat_server = http.createServer(function(req,res){});

chat_server.listen(8080);

io.listen( chat_server,{

	onClientMessage : function( message, client){
		sys.puts('MESSAGE RECIEVED: '+message);
		client.broadcast( message );
	}
});
