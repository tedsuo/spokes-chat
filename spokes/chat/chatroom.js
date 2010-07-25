domain = 'http://'+document.domain;

// INITIALIZE WEBSOCKET
io.setPath( domain+'/say/lib/Socket.IO/');

// MUSTACHE.JS TEMPLATES
var templates = {
	message : '\
	<div class="message-block">\
		<span class="user-name" style="color:{{handle_color}};font-family:{{font}};">{{user_name}}: </span><span class="message" style="color:{{text_color}};font-family:{{font}};">{{message}}</span>\
	</div>\
',

 user : '\
	<div class="user-list-item">\
		<span class="user-name" style="color:{{handle_color}};font-family:{{font}};">{{user_name}}\
	</div>\
'
};

// ASSETS
assets = {
	sent_audio : new Audio(domain+"/chat/sounds/sent.ogg"),
	recieved_audio : new Audio(domain+"/chat/sounds/ding.ogg")
};
//

// USER
var user = {
	id : false,
	name : false
};

// CHAT CLIENT
var chat = {

	// INIT
	// conntect to db, create user-driven events
	initialize : function(){
		chat.initialize_websocket();
		chat.initialize_user_events();
	},
	
	// INITIALIZE WEBSOCKET
	//	socket.io websocket
	socket : false,
	initialize_websocket : function(){
	
		chat.socket = new io.Socket(null, {rememberTransport: false, port: 8080});
		chat.socket.connect();
		
		chat.socket.addEvent( 'message', 
			function(json_data){
		    var msg = JSON.parse( json_data );
		    switch (msg.type){
		    
					case 'newMessage':
			  		chat.add_message(msg);
			  		chat.update_user(msg);
			  		assets.recieved_audio.play();
			  		break;
			  
			  	case 'userConnected':
			  		chat.update_user(msg);
			  		chat.annouce_user();
			  		break;

			  	case 'userAnnouce':
			  		chat.update_user(msg);
			  		break;
			  
			  	case 'userDisconnected':
			  		chat.remove_user(msg);
			  		break;
			  }
			}
		);
		
	},
	
	// INITIALIZE USER DRIVEN EVENTS ( USER STORIES )
	// each chat.user_stories function initializes 
	// user driven event cycles, broken down by user 
	// story

	initialize_user_events : function(){
		$.each( chat.user_stories,
			function( user_story_name, func){

				chat.user_stories[user_story_name]();

			}
		);
	},

	// USER STORIES

	user_stories : {
		user_selects_the_options_menu : function(){
			$('#options-btn').toggle(
				function(event){
					event.preventDefault();
					$('#user-options').slideDown();
				},
				function(event){
					event.preventDefault();
					$('#user-options').slideUp();
				}
			);
		},
		
		user_creates_a_message : function(){
			$('#send-message').click(function(event){
				event.preventDefault();
				chat.create_message();
			});
			
			$('#message').keypress(function(event) {
			  if (event.keyCode == '13') {
	     		event.preventDefault();
	     		chat.create_message();
	     		$(this).val('');
	     	}
	   	});
		},
	
		user_creates_a_handle : function(){
			$('#set-user-name').keypress(function(event) {
			  if (event.keyCode == '13') {
	     		event.preventDefault();
					chat.start_chat_session();
	     	}
	   	});
	
			$('#set-user-name-btn').click(function(event){
				event.preventDefault();
				chat.start_chat_session();
			});
			
		},
	},
		
	start_chat_session : function(){
		// set user_name option from dialog box
		$('#user-name').val( $('#set-user-name').val() );
		user.id = $('#set-user-name').val();
		chat.create_user();
		
		// hide floaty dialog box
		$('#overlay').fadeOut(600);
		$('#floating-window').fadeOut(300);			
		// user focus on the message box, chat away!
		$('#message').focus();
		// add user to user list display

		// ding!
		assets.recieved_audio.play();		
	},
	
	create_user : function(){
		var msg = {
			type: 'userConnected',
			user_name: $('#user-name').val(),
			user_id: user.id,
			handle_color: $('#handle-color').val(),
			text_color: $('#text-color').val(),
			font: $('#font').val()			
		};
		chat.send_message(msg);
		chat.add_user(msg);
	},
	
	annouce_user : function(){
		var msg = {
			type: 'userAnnouce',
			user_name: $('#user-name').val(),
			user_id: user.id,
			handle_color: $('#handle-color').val(),
			text_color: $('#text-color').val(),
			font: $('#font').val()			
		};
		chat.send_message(msg);
	},
	
	update_user : function(msg){

		var user_not_found = true;
		$('.user-list-item').each(function(){
			
			if( $(this).data('user_id') == msg.user_id ){
				
				user_not_found = false;
				var html = Mustache.to_html(templates.user, msg);
				$(html)
				.data('user_id',msg.user_id)
				.replaceAll(this);
			}
		});
		if( user_not_found ){
			chat.add_user(msg);
		}
	},
	
	add_user : function(msg){
		var html = Mustache.to_html(templates.user, msg);
		
		$(html)
		.data('user_id', msg.user_id)
		.appendTo('#user-list');
	},

	remove_user : function(msg){
		$('#user-list').children.each(function(index,value){
			append( html );	
		});
	},
	
	create_message : function(msg){
			var msg = {
				type: 'newMessage',
				user_id: user.id,
				user_name: $('#user-name').val(),
				message: $('#message').val(),
				handle_color: $('#handle-color').val(),
				text_color: $('#text-color').val(),
				font: $('#font').val()
			};
			
			chat.add_message(msg);
			chat.send_message(msg);
	    assets.sent_audio.play();
	},
	
	send_message : function(msg){
		chat.socket.send( JSON.stringify(msg) );
	},
	
	add_message : function(msg){
		var html = Mustache.to_html(templates.message, msg)
		$('#chat-window')
		.append( html )
		.scrollTop(1000000);
	}
	
};

$(function(){
	chat.initialize();
	$('#set-user-name').focus();
});