// VIEWS

eml.view.define({
	
	TopMenu : function(){
			
		$('#top-menu').empty();
		
		$('<a class="button" href="#/email/new">New Email</a>')
			.button()
			.appendTo('#top-menu');
			
		$('<a class="button" href="#/settings">Settings</a>')
			.button()
			.appendTo('#top-menu');
	},

	EmailList : function(emails,options){
		var data, status;

                // Cache data for page refresh		
		var cache = eml.model.cache('EmailList', {data:emails, options:options});
		emails = cache.data || {};
		options = cache.options || {};

	        // email list item mustache template
		var template = '<div class="email-list-item"><a href="#/email/{{id}}"><span class="ui-icon ui-icon-{{icon}}"></span><span class="email-sender">{{sender}}</span><span class="email-subject">{{subject}}</span></a></div>';		

		// initialize container html
		$('#email-list').empty();

	        // create list items
		$.each( emails, function(index,email){

                                // get email's status
				status = eml.model.Status.find(email.status_id);

                                // data for mustache template				
				data = {
					id: email.id,
					sender: email.sender,
					subject: email.subject,
					icon: status.icon || 'none'
				};
				
                                // create email list item from mustaceh template
                                // attach email_id data to list item
                                // make list item draggable
				$( Mustache.to_html( template, data) )
					.data({email_id: email.id})
					.draggable({
							zIndex:'999999',
							delay: 300,
							revert:true,
							helper: function() {
								return $(this)
									.clone()
									.addClass('email-list-item-draggable');
							},
							containment: "#templator"})
					.appendTo('#email-list');
				 
			});
	},

	Email : function(email,options){

		var data = {
			id: email.id,
			sender : email.sender,
			subject : email.subject,
			body : email.body
		};

		var template = '																			\
	<form id="email-form" 			 														\
				action="#/email/{{id}}"														\
				method="post"					 														\
				>																								 	\
			<ul>																							 	\
				<li>																						 	\
					<input type="hidden" name="id" value="{{id}}"/>	\
					<span class="label">SENDER</span>							 	\
					<input 	type="text" 													 	\
									id="email-sender-input" 							 	\
									name="sender" 												 	\
									value="{{sender}}"										 	\
									/>																		 	\
					<div class="clear"></div>											 	\
				</li><li>																				 	\
					<span class="label">SUBJECT</span>						 	\
					<input 	type="text" 													 	\
									id="email-subject-input" 							 	\
									name="subject" 												 	\
									value="{{subject}}"										 	\
									/>																		 	\
					<input 	id="save-email-btn" 									 	\
									class="button" 												 	\
									type="submit" 												 	\
									name="save" 													 	\
									value="save"													 	\
									/>																		 	\
					<div class="clear"></div>											 	\
				</li>																						 	\
			</ul>																							 	\
			<textarea id="email_editor" name="body">						\
				{{body}}																					\
			</textarea>																				 	\
	</form>';
		
		$('#email-controls').html( Mustache.to_html(template,data));
		// engage email wysiwyg editor
		$('#save-email-btn').button();
		eml.view.create_editor('email_editor');
	},

	FolderList : function(folders,options){

                // cache view to make it refreshable
		var cache = eml.model.cache('FolderList', {data:folders, options:options});
		folders = cache.data || {};
		options = cache.options || {};

                // empty container html				
		$('#folder-list').empty();
		
                // create floder list mustache template
 		var template = '<a id="folder-list-item-{{id}}" class="list-item button {{current_folder}}" href="#/folder/{{id}}"><span href="#/folder/{{id}}" id="folder-counter-{{id}}" class="counter">{{count}}</span><span class="ui-icon ui-icon-folder-collapsed"></span>{{name}}</a>';

                // create "Show All" folder item
		var data = {
			id : 'all',
			name : 'Show All',
			count : eml.model.Email.count(),
		};
                // check for current folder
		if(options.current_folder == 'all') data.current_folder = 'current';
		
		$( Mustache.to_html(template,data) )
			.appendTo('#folder-list');
		
		$.each( folders, function( index, folder){

			data = {
				id : folder.id,
				name : folder.name,
				count : folder.getEmailCount(),
			};
			
			if(options.current_folder == folder.id) data.current_folder = 'current';
			
			$( Mustache.to_html(template,data) )
				.data( {folder_id : folder.id} )
				.appendTo('#folder-list')
				.droppable({
						accept : '.email-list-item',
						hoverClass : 'drop-hover',
						drop : function( e, ui){
							var data = {
								email_id : ui.draggable.data('email_id'),
								folder_id : $(this).data('folder_id')
							}
							eml.event.trigger('move_email_to_new_folder', data);
						}
					});		

		});
		
	},

	StatusList : function( statuses, options ){
		var cache = eml.model.cache('StatusList', {data:statuses, options:options});
		statuses = cache.data;
		options = cache.options;
		statuses = statuses || {};
		options = options || {};
						
		// initialize container
		$('#status-list').empty();
		// create Mustache template
 		var template = '<a id="status-list-item-{{id}}" class="list-item button {{current_status}}" href="#/status/{{id}}"><span href="#/status/{{id}}" id="status-counter-{{id}}" class="counter" style="background-color:{{background_color}};">{{count}}</span><span class="ui-icon ui-icon-{{icon}}"></span>{{name}}</a>';

		// create Show All button
		var data = {
			id : 'all',
			name : 'Show All',
			count : eml.model.Email.count(),
			icon: 'none'
		};
		// add current class if current
		if(options.current_status == 'all') data.current_status = 'current';
		
		$( Mustache.to_html(template,data) )
			.appendTo('#status-list');
		
		// create Status List
		$.each( statuses, function( index, status){
			
			data = {
				id : status.id,
				name : status.name,
				count : eml.model.Email.count({where:{status_id : status.id}}),
				icon: status.icon,
				background_color: status.background_color
			};
			// add current class if current			
			if(options.current_status == status.id) data.current_status = 'current';
			
			$( Mustache.to_html(template,data) )
				.data( {status_id : status.id} )
				.appendTo('#status-list')
				.droppable({
						accept : '.email-list-item',
						hoverClass : 'drop-hover',
						drop : function( e, ui){
							var data = {
								email_id : ui.draggable.data('email_id'),
								status_id : $(this).data('status_id')
							}
							eml.event.trigger('move_email_to_new_status', data);
						}
					});		

		});
		
		$( '<div class="clear"></div>' ).appendTo('#status-list');
	}
});