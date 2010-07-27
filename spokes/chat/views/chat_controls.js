chat.view.define({
	ChatControls : function(user_data){
		var html = chat.template.ChatControls;

		$(chat.config.targets.chat_controls)
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
	}
});