var http = require('http'), 
		url = require('url'),
		fs = require('fs'),
		io = require('./lib/Socket.IO-node/lib/socket.io'),
		sys = require('sys'),

chat_server = http.createServer(function(req,res){
		var path = url.parse(req.url).pathname;

/*
    if (/\.(js|html|swf)$/.test(path)){
				try {
					var swf = path.substr(-4) === '.swf';
					res.writeHead(200, {'Content-Type': swf ? 'application/x-shockwave-flash' : ('text/' + (path.substr(-3) === '.js' ? 'javascript' : 'html'))});
					res.write(fs.readFileSync(__dirname + path, swf ? 'binary' : 'utf8'), swf ? 'binary' : 'utf8');
					res.end();
				} catch(e){ 
					send404(res);
				}
		} else {
		
	    res.writeHead(200, {'Content-Type': 'text/html'});
  	  res.end('<h1>Hello world</h1>');

		}
*/
});

chat_server.listen(8080);

io.listen( chat_server,{

	onClientMessage : function(message,client){
		sys.puts('MESSAGE RECIEVED: '+message);
		client.broadcast( message );
	}
});
