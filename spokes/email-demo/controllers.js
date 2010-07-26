// CONTROLLERS

// Application controller
// Main controller run on page load


eml.controller.define( {
	
	name : 'Application',

	before_filters : {

		before_loading : function(){
				// display loading graphic, etc				
				eml.event.trigger('show_loading_graphic');		
		},
		
		initialize_page : function(){
			if(!eml.config['page_initialized']){
				// load top menu
				eml.view.TopMenu();
				
				// enable resizing on layout frames
				jQuery('#sidebar').resizable({
						handles : {e:'#sidebar-resize-handle-container'}
						});
				jQuery('#email-list-resizer').resizable({
						handles : {s:'#email-list-resize-handle-container'},
						alsoResize: '#email-list'
						});	

				// connect to the db to load initial data,
				// block proccessing until data is returned
				eml.db.connect({async:false});

				// set flag to true so page doesn't load twice
				eml.config['page_initialized'] = true;		
			}
		}
		
	},
	
	after_filters : {
	
		after_loading : function(){
				// hide loading graphic, etc				
				eml.event.trigger('hide_loading_graphic');		
		}	
	},
	
	routes : {
	
		index : {
			method : 'get',
			target : '',
			action : function(){

			}
		},

		edit_email : {
			method : 'get',
			target : '#/email/:id',
			action : function(){
				var email;
				// get current email
				if( this.params['id'] == 'new'){
					email = eml.model.Email.create();
				} else {
					email = eml.model.Email.find(this.params['id']);
				}
				// display current email
				eml.view.Email(email);
				
			}
		},

		save_email : {
			method : 'post',
			target : '#/email/:id',
			action : function(){
				var email;
				
				// get current email
				if( this.params['id'] == 'new'){
					email = eml.model.Email.create();
				} else {
					email = eml.model.Email.find(this.params['id']);
				}	
				
				email.updateAttributes({
					sender: this.params['sender'],
					subject: this.params['subject'],
					body: this.params['body']
				});
				
				eml.db.connect({
					method: 'POST',
					event: 'Email#save',
					data: email.toJSON()
				});
				
				this.redirect('#/email/'+email.id);
				
			}
		},
		
		folder_index : {
			method : 'get',
			target : '#/folder/',
			action : function(){
				var emails = eml.model.Email.find();
				// display email list 
				$('#email-list').html( eml.view.EmailList(emails) );
			}
		},
		
		show_emails_by_folder : {
		
			method : 'get',
			target : '#/folder/:id',
			action : function(){
				
				var folder, emails, options={};
				
				if(this.params['id'] == 'all'){
				// get all emails
					emails = eml.model.Email.find();
					options.current_folder = 'all';
				} else {
				// get current folder
					folder = eml.model.Folder.find(this.params['id']);
				// get emails in current folder
					emails = folder.getEmailList();
					options.current_folder = folder.id;
				}
				
				// display email list 
				eml.view.EmailList(emails);

				folders = eml.model.Folder.find();
				status = eml.model.Status.find();				
				eml.view.FolderList(folders,options);
				eml.view.StatusList(status,{});
			},
		},
		
		show_emails_by_status : {
		
			method : 'get',
			target : '#/status/:id',
			action : function(){
				
				var status, emails, options={};
				
				if(this.params['id'] == 'all'){
				// get all emails
					emails = eml.model.Email.find();
					options.current_status = 'all';
				} else {
				// get current status
					status = eml.model.Status.find(this.params['id']);
				// get emails with current status
					emails = eml.model.Email.find({where:{'status_id':status.id}});
					options.current_status = status.id;
				}
				
				// display email list 
				eml.view.EmailList(emails);

				statuses = eml.model.Status.find();
				folders = eml.model.Folder.find();
				eml.view.StatusList(statuses,options);
				eml.view.FolderList(folders,{});
				
				eml.event.trigger('db_load_Folder');
			}

		},
		
		db_load_Email : function( e, params){
			if(eml.cache['EmailList']){
				eml.view.EmailList();
			} else {
				var emails = eml.model.Email.find();
				eml.view.EmailList(emails);
			}
		},

		db_load_Folder : function( e, params){
			if(eml.cache['FolderList']){
				eml.view.FolderList();			
			} else {
				var folders = eml.model.Folder.find();
				var options = {};
				eml.view.FolderList(folders,options);
			}
		},

		db_load_Status : function( e, params){
			if(eml.cache['StatusList']){
				eml.view.StatusList();			
			}else{
				var statuses = eml.model.Status.find();
				var options = {};
				eml.view.StatusList(statuses,options);
			}
		},
						
		move_email_to_new_folder : function( e, params ){
			eml.log( 'MOVING EMAIL: '+ params['email_id'] );
			eml.log( 'TO FOLDER: '+ params['folder_id'] );		
			
			var email = eml.model.Email.find(this.params['email_id']);
			var old_folder = eml.model.Folder.find(email.folder_id);
			var new_folder = eml.model.Folder.find(params['folder_id']);

			email.set('folder_id',new_folder.id);
			email.save();

			eml.view.FolderList( eml.model.Folder.find(), {current_folder: old_folder.id} );
			eml.view.EmailList( old_folder.getEmailList()  );
			
		},

		move_email_to_new_status : function( e, params ){
			eml.log( 'MOVING EMAIL: '+ params['email_id'] );
			eml.log( 'TO STATUS: '+ params['status_id'] );		
			
			var email = eml.model.Email.find(this.params['email_id']);
			var old_status = eml.model.Status.find(email.status_id);
			var new_status = eml.model.Status.find(params['status_id']);

			email.set('status_id',new_status.id);
			email.save();

			eml.view.StatusList( eml.model.Status.find(), {current_status: old_status.id} );
			eml.view.EmailList( eml.model.Email.find({where:{status_id: old_status.id}})  );
			
		},
		
		Email_afterSave : function(){
			eml.view.FolderList();
			eml.view.StatusList();
			eml.view.EmailList();
		},
		
		show_loading_graphic : function( e, params){
			$('#db-status-loading').addClass('db-status-loading-on')
														 .removeClass('db-status-loading-off');
			$('#db-status-ready').addClass('db-status-ready-off')
													 .removeClass('db-status-ready-on');
		},

		hide_loading_graphic : function( e, params){
			$('#db-status-loading').addClass('db-status-loading-off')
														 .removeClass('db-status-loading-on');
			$('#db-status-ready').addClass('db-status-ready-on')
													 .removeClass('db-status-ready-off');
		}
						
	}
	
});
