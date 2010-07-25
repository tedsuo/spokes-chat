// VIEWS

chat.view.define({
	
	LoginWindow : function(){
		var html = chat.template.LoginWindow;
		$(html)
		.prependTo('body');

		$('#floating-window').fadeIn();
		
		$('#set-user-name').focus();
		
		$('#set-user-name').keypress(function(event) {
		  if (event.keyCode == '13') {
     		event.preventDefault();
     		login();
     	}
   	});

		$('#set-user-name-btn').click(function(event){
			event.preventDefault();
			login();
		});		
		
		// close form and create new user,
		function login(){
  		var user_name = $('#set-user-name').val();
			chat.event.trigger('create_current_user', user_name);
			// hide floaty dialog box
			$('#overlay').fadeOut(600,function(){
				$(this).remove();
			});
			$('#floating-window').fadeOut(300,function(){
				$(this).remove();
			});
			// user focus on the message box, chat away!
			$('#message').focus();
		}	
	},
	
	ChatMessage : function(message){
		var html = Mustache.to_html( chat.template.ChatMessage, message);
		$('#chat-window')
		.append( html )
		.scrollTop(1000000);
		
	},
	
	UserListItem : {	
		create : function(user_data){
			var html = Mustache.to_html(chat.template.UserListItem, user_data);
			
			$(html)
			.data('user_id', user_data.id)
			.appendTo('#user-list-window');
		},
		update : function(user_data){
			var html = Mustache.to_html(chat.template.UserListItem, user_data);
			
			$(html)
			.data('user_id', user_data.id)
			.replaceAll('#user-list-item-' + user_data.id);
		},
		destroy : function(user_data){
			$('#user-list-item-'+user_data.id)
			.fadeOut(function(){
				$(this).remove();
			})	
		}
	},
	
	ChatOptions : function(user_data){
		var html = chat.template.ChatOptions;
		$(html)
		.prependTo('body');
		
		$('#overlay').fadeIn(300);
		$('#floating-window').fadeIn(600);
		
		$('#user-name').val(user_data.name);
		$('#handle-color').val(user_data.handle_color);
		$('#text-color').val(user_data.text_color);
		$('#font').val(user_data.font);	

		$('#user-name').focus();
		
		$('#save-chat-options-btn').click(function(event){
			event.preventDefault();
			user_data = {
				name : $('#user-name').val(),
				handle_color : $('#handle-color').val(),
				text_color : $('#text-color').val(),
				font : $('#font').val()
			};
			chat.event.trigger('update_current_user', user_data);
			
			$('#overlay').fadeOut(600,function(){
				$(this).remove();
			});
			$('#floating-window').fadeOut(300,function(){
				$(this).remove();
			});			
		});

	},
	
	ChatControls : function(user_data){
		var html = chat.template.ChatControls;

		$('#chat-controls-window')
		.empty()
		.append(html);
		
		$('#options-btn').click(function(event){
			event.preventDefault();
			chat.event.trigger('edit_chat_options');			
		});
		
		$('#send-message').click(function(event){
			event.preventDefault();
			create_chat_message();
		});
		
		$('#message').keypress(function(event) {
		  if (event.keyCode == '13') {
     		event.preventDefault();
				create_chat_message();
     	}
   	});
   	
   	function create_chat_message(){
			chat.event.trigger('create_chat_message', $('#message').val());
   		$('#message').val('');   	
   	}		
	},

});