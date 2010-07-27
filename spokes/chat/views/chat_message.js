chat.view.define({
	ChatMessage : function(message){
		var html = Mustache.to_html( chat.template.ChatMessage, message);

		$( chat.config.targets.chat_window )
		.append( html )
		.scrollTop(1000000);	
	}
});