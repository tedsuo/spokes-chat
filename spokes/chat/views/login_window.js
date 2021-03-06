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
		
		// function: login()
		// close form, open chat window, and create a new user
		function login(){
  		var user_name = $('#set-user-name').val();
			chat.event.trigger('create_current_user', user_name);
			chat.event.trigger('open_chat_window');
			

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
	}
});