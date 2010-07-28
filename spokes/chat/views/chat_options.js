chat.view.define({
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
			$('.chatroom #message').focus();
		});

	}
});