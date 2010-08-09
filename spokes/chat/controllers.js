chat.controller.define( {
	
	name : 'Application',
	
	before_filters: {
		start_chatroom : function(){
				if ( !chat.config.chatroom_initialized ){
					chat.view.LoginWindow();
					chat.event.trigger('close_chat_window');
					chat.config.chat_started = true;
					chat.config.chatroom_initialized = true;
				}
			},
	},
	
	routes : {
	
		index : {
			method : 'get',
			target : '',
			action : function(){
// stub to get Sammy to work?
			}
		},
		
		create_current_user : function( e, user_name ){
			var user = chat.model.User.create({
				name: user_name,
				_id: user_name,
				handle_color: chat.config.defaults.handle_color,
				text_color: chat.config.defaults.text_color,
				font: chat.config.defaults.font
			});
			
			chat.config.current_user_id = user.id;

			chat.db.send({event:'user_connected', data: user.toObject()});
			chat.log(user.toObject());

			chat.view.UserListItem.create(user.toObject());
			chat.view.ChatControls(user.toObject());
			
			chat.assets.sounds.ReceivedChat.play();
		},
		
		update_current_user : function( e, user_data ){
			var user = chat.model.User.find(chat.config.current_user_id);
			user.updateAttributes(user_data);
			chat.view.UserListItem.update(user.toObject());
			chat.db.send({ event: 'user_announce', data: user.toObject()});
		},
		
		announce_current_user : function(e){
			if(chat.config.current_user_id){
				var user = chat.model.User.find(chat.config.current_user_id);
				chat.db.send({ event: 'user_announce', data: user.toObject()});
			}
		},
		
		create_or_update_user : function( e, user_data){
			var user = chat.model.User.find({first: true, where: { _id: user_data._id}});
			
			if( !user ){
				user = chat.model.User.create({
					name: user_data.name,
					_id: user_data.name,
					handle_color: user_data.handle_color,
					text_color: user_data.text_color,
					font: user_data.font
			 	});
				chat.view.UserListItem.create(user.toObject());
			} else {
				user.updateAttributes({
					name:  user_data.name,
					handle_color: user_data.handle_color,
					text_color: user_data.text_color,
					font: user_data.font
			 	});
				chat.view.UserListItem.update(user.toObject());
			}
		},
	
		destroy_user : function( e, user_data){
			var user = chat.model.User.find({first: true, where: {_id: user_data._id}});
			user.destroy();
			chat.view.UserListItem.destroy(user_data);			
		},
		
		create_chat_message : function( e, message_text ){
				var user = chat.model.User.find( chat.config.current_user_id );

				var chat_message = {
					message: message_text,
					_id: user._id,
					name: user.name,					
					handle_color: user.handle_color,
					text_color: user.text_color,
					font: user.font
				};
						
				chat.view.ChatMessage( chat_message );
				chat.db.send({ 
					event: 'new_message', 
					data: chat_message 
				});
		    chat.assets.sounds.SentChat.play();
		},

		recieved_chat_message : function( e, chat_message ){
				var user = chat.model.User.find(chat.config.current_user_id);

				var chat_message = {
					message: chat_message.message,
					_id: chat_message._id,
					name: chat_message.name,					
					handle_color: chat_message.handle_color,
					text_color: chat_message.text_color,
					font: chat_message	.font
				};
						
				chat.view.ChatMessage(chat_message);
		    chat.assets.sounds.ReceivedChat.play();
		},
		
		edit_chat_options : function(){
				var user = chat.model.User.find(chat.config.current_user_id);
				chat.view.ChatOptions(user.toObject());		
		},
		
		close_chat_window : function(){
			$('#chatroom').fadeOut(300);

		},
		
		open_chat_window : function(){
			$('#chatroom').fadeIn(300);
		}	
	},
	
	server_events : {
	
		new_message : function( e, msg){
			chat.event.trigger('recieved_chat_message',msg);
			chat.event.trigger('create_or_update_user',msg);
			chat.assets.sounds.ReceivedChat.play();
		},
	
		user_connected : function( e, msg){
			chat.event.trigger('create_or_update_user',msg);
			chat.event.trigger('announce_current_user',msg);
		},
	
		user_announce : function( e, msg){
			chat.event.trigger('create_or_update_user',msg);
		},
		
		user_disconnected : function( e, msg){
			chat.event.trigger('destroy_user',msg);
		}		
		
	}

	
});