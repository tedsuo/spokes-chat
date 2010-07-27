chat.view.define({
	UserListItem : {	
		create : function(user_data){
			var html = Mustache.to_html(chat.template.UserListItem, user_data);
			
			$(html)
			.data('user_id', user_data.id)
			.appendTo( chat.config.targets.user_list );
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
	}
});