/*
 *  SAY
 *
 *  description: say.js is the javascript MVC for Spokes
 *	
 *	global footprint: new_spokes_application() is the only global namespace 
 *	required by say.js however, a number of open source libraries and 
 *	dependencies can be found in lib/, which must be loaded before this script
 *	in order to be used.
 *
 *	REQUIRED LIBRARIES
 *	Sammy
 *	ActiveRecord.js
 *	jQuery
 *
 *	OPTIONAL VIEW LIBRARIES
 *	jQueryUI
 *	Mustache.js
 *	CKeditor
 *
 *	One of the ultimate goals of say.js is to be a small, consise interface, 
 *	with a number of adapters to allow integration with a variety of open source 
 *	models, controllers, and view helpers.  However, at this point in development
 *	only Sammy controllers and ActiveRecord.js models are supported. Views are 
 *	more flexible, and additional view libraries and jquery plugins can easily be
 *	integrated, by requiring the library and adding view helper functions to the 
 *	say.view namespace. 
 */

// new_spokes_application is the primary way to create a new spokes application.
// 


function new_spokes_application(){

var say = {};

// DB
// datastore for say.model

say.db = {
	
	// default connection
	host: 'http://localhost/',
	port: 80,
	adapter_type: 'ajax', // ajax or websocket

	// set connection
	// TODO: clean incoming request
	create:	function( request ){
	
		if( !request ) request = {};

		// initialize request
		say.db.host = request.host || say.db.host;
		say.db.port = request.port || say.db.port;
		say.db.adapter_type = request.adapter || say.db.adapter_type;

		// set server connection type
		say.db.connect();
		
		// create database event cycle
		say.event.create_events([
			'db_before_request',
			'db_after_request',
			'db_before_successful_response',
			'db_after_successful_response',
			'db_connection_error'
		]);
										
		// setup ActiveRecord models and in-memory database 		
		say.model.initialize();

	},
	
	send: function( request ){
		say.db.connection_adapter.send( request );
	},

	connect : function(){
		if(say.db.adapter_type == 'ajax'){
			say.db.connection_adapter = say.db.adapters.ajax;
		} else if (say.db.adapter_type == 'websocket'){
			say.db.connection_adapter = say.db.adapters.websocket;
			say.db.connection_adapter.initialize();
		}
	},
		
	adapters: {
		ajax : {
			send : function(request){
				// initialize incoming request 
				request = request || {};
				if(!(request.async === false)){
					request.async = true;
				}
				
				say.log('ASYNC');
				say.log(request.async);
		
				// initialize request to server
				server_request = {};
				server_request.method = request.method || 'GET';
				server_request.event = request.event || '';
				server_request.query = request.query || {};
				server_request.data = request.data || {};
		
				say.notify.db_before_request();
		
				var ajax_request = {
							url: say.db.host,
							data: server_request,
							type: server_request.method,
							async: request.async,
							dataType: 'json',
							timeout: 0,
							success: function(data){
								say.event.trigger('db_before_successful_response');
								say.log('Data Recieved');
		//						say.log(json);
		//						var data = JSON.parse(json);
								say.log(data);				
								if(data.model) say.model.update( data.model );
								say.event.trigger('db_after_successful_response');
							},
							error: function(response){
								say.log('Data Error');
								say.log(response);
								say.event.trigger('db_connection_error');				
							}			
				};
		
				say.log('SENDING REQUEST TO SERVER');
				say.log(ajax_request);
				
				// send ajax request to server
				$.ajax(ajax_request);
		
				say.event.trigger('db_after_request');
				
			}
		},
		
		websocket : {
			initialize : function(){
				io.setPath('/say/lib/Socket.IO/');			

				say.db.websocket = new io.Socket(null, {rememberTransport: false, port: 8080});
				say.db.websocket.connect();

				say.db.websocket.addEvent( 'connect', function(){
				    say.event.trigger('websocket_connected');
				});				
				say.db.websocket.addEvent( 'message', function(json_data){
				    var msg = JSON.parse( json_data );
				    say.db.adapters.websocket.receive(msg);
				});
				say.db.websocket.addEvent( 'disconnect', function(){
				    say.event.trigger('websocket_disconnected');
				});
			},
			
			receive : function(msg){
				say.event.trigger('db_before_successful_response', msg);
				
				say.log('Data Recieved');
				say.log(msg);

				if(msg.event) say.event.trigger( msg.event, msg.data);
				if(msg.model) say.model.update( msg.model );
				
				say.event.trigger('db_after_successful_response', msg);	
			},
			
			send : function(msg){
		
				say.event.trigger('db_before_request',msg);
				
				say.log('SENDING MESSAGE TO SERVER');
				say.log(msg);
				
				say.db.websocket.send( JSON.stringify(msg) );
		
				say.event.trigger('db_after_request',msg);
			
			}
		}
	},
		
	to_json : function(){
		return ActiveRecord.connection.serialize();
	}
	
};

// MODEL
// client-side representation of the model layer
// uses say.db for data storage to server 

say.model = {
	
	// initialize: setup model layer
	initialize : function( request ){
		if( say.config.model.initialized ) return;

		request = request || { model_data : '' }
		

		// create model event cycle
		say.event.create_events([
					'model_defined',
					'model_created',
					'model_updated',
					'model_destroyed'
					]);
						
		// Ó
		ActiveRecord.connect( ActiveRecord.Adapters.InMemory, request.model_data);

		// turn on ActiveRecord logging
		ActiveRecord.logging = true;

		// create ActiveRecord in-memory event notifications
		ActiveRecord.connection.observe('created',function(model_name,id,data){
			say.notify.model_created({name: model_name, id: id, data: data});
		});
		ActiveRecord.connection.observe('updated',function(model_name,id,data){
			say.notify.model_updated({name: model_name, id: id, data: data});
		});
		ActiveRecord.connection.observe('destroyed',function(model_name,id,data){
			say.notify.model_destroyed({name: model_name, id: id, data: data});
		});
		
		say.config.model.initialized = true;
 	},
 	
	// define: defines an activerecord model
	define : function( request ){
 		var model;

		// initialize model layer if not already
		say.model.initialize();

		// initialize request
 		request.attributes = request.attributes || {};
		request.validates_presence_of = request.validates_presence_of || {};
		request.has_one = request.has_one || {};
		request.has_many = request.has_many || {};
		request.belongs_to = request.belongs_to || {};
		
		say.log('DEFINING MODEL');
		say.log( request );
	
		// create ActiveRecord Model
		model = ActiveRecord.define( 
					{tableName : request.name, modelName: request.name}, 
					request.attributes,  
					request.functions
				);

		// Define Model Lifcycle
		var lifecycle = { 
				after_find : 'afterFind',
				before_save : 'beforeSave',
				after_save : 'afterSave',
				before_create : 'beforeCreate',
				after_create : 'afterCreate',
				before_destroy : 'beforeDestroy',
				after_destroy : 'afterDestroy'
				};

		// Attach Lifecyle Observers
		$.each( lifecycle, function( lifecycle_event_name, activerecord_event_name ){
			
			if( request[ lifecycle_event_name ]){
				say.log( request.name + ' ATTACHING OBSERVER: ' + lifecycle_event_name);
				model.observe( activerecord_event_name, request[ lifecycle_event_name ]);
			}

			var model_event = request.name+'_'+lifecycle_event_name;
			say.event.create( model_event );
			model.observe( activerecord_event_name, function(){
				say.log('NOTIFY: ' + model_event);
				var event = say.notify[model_event];
				event( model );
			});	
		});

		// Set Model Validations
		$.each( request.validates_presence_of, function( attribute_name ){

			model.validatesPresenceOf( attribute_name );

		});

		// Set Has One Relationships
		$.each( request.has_one, function( model_name ){

			model.hasOne( model_name );

		});

		// Set Has Many Relationships
		$.each( request.has_many, function( model_name ){

			model.hasMany( model_name );

		});

		// Set Belongs To Relationships
		$.each( request.belongs_to, function( model_name ){

			model.belongsTo( model_name );

		});

		// add model to say.model namespace
		say.model[ request.name ] = model;
		
		say.notify.model_defined();	

		return 	say.model[ request.name ];

	},  

	// cache: store results so that views can refresh themselves
	cache : function( key, recordset){
			if (recordset.data){ 
				say.cache[key] = recordset;
				return recordset;
			} else {
				var cache = say.cache[key];
				cache.data.reload();
				return cache;
			}
	},
	
	// update: defines models and updates in-memory database from object 
 	update : function( response ){
 	
 		$.each( response, function( model_name, model_data){
			// Define model if requested
 			if(model_data.definition){
 				say.log('DEFINING MODEL:' + model_name);
 				say.model.define(model_data.definition);
 			}
 			// Update in-memory db table
 			if(model_data.table){
 				say.log('LOADING MODEL TABLE: ' + model_name);
 				$.each( model_data.table, function( index, row){
	 				ActiveRecord.connection.insertEntity(model_name,'id', row);
 				});
 			}
 			event_name = 'db_load_' + model_name;
 			say.event.create(event_name);
 			say.notify[event_name]();
 		});	

 	}
 	
};



// EVENT
say.event = {
	
	add : function( actions ){
		$.each(actions, function(event_name, action){
			say.event.create(event_name);
			say.event.bind(event_name, action);
		});
	},
	
	create : function(event_name){
		if(say.notify[event_name]) return;
		say.notify[event_name] = function(data, options){
			$('body').triggerHandler(event_name, data, options);
		};
		say.event.bind( event_name, {name: event_name});
		say.log( 'EVENT CREATED: '+ event_name);
	},
	
	create_events : function( event_names ){
		say.log('CREATING EVENTS');
		$.each( event_names, function( index, name ){
			say.event.create( name );
		});
	},
	
 	bind : function( event_name, action){
		$('document').bind( event_name, action);
	},
	
	trigger : function( event_name, data, options){
			say.event.create(event_name);
			say.log('EVENT TRIGGERED: ' + event_name);
			if(data){
				say.log('DATA');
				say.log(data);
			}
			if(options){
				say.log('OPTIONS');
				say.log(options);
			}
			var handler = say.notify[event_name];
			handler( data, options);
	}
 	
};

// LOG
say.log = function(msg){
	if( window.console ) console.log( msg );
}

// NOTIFICATIONS
//
// say.notify.event_name( data, options);
//

say.notify = {};

// VIEWS
say.view = {
	
	define : function( views ){
			$.each( views, function( view_name, view_function){
				say.view[view_name] = view_function;
			});
	},
	
	create_editor : function( editor_id ) {
		
  		var instance = CKEDITOR.instances[editor_id];
		var content = $('#'+editor_id).html();

	    if(instance){
        	CKEDITOR.remove(instance);
    	}
		
		var config = {
			toolbar_Full : [
			    ['Source','-'],
			    ['Cut','Copy','Paste','PasteText','PasteFromWord'],
			    ['Undo','Redo','-','Find','Replace','-','SelectAll','RemoveFormat'],
			    ['Bold','Italic','Underline','Strike','-','Subscript','Superscript'],
			    ['NumberedList','BulletedList','-','Outdent','Indent','Blockquote'],
 			    '/',
			    ['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],
			    ['Link','Unlink','Anchor'],		    
			    ['Image','HorizontalRule','SpecialChar'],
			    ['Styles','Format','Font','FontSize'],
			    ['TextColor','BGColor']
			],
			pasteFromWordRemoveFontStyles : false,
			resize_enabled : false,
			height : '400px'
		};
		
    	CKEDITOR.replace(editor_id ,config);

		$('#'+editor_id).val(content);
	}
};

// CONTROLLERS
say.controller = {

	define : function( controller_def ){

		var controller;
		// initialize definition
		controller_def.target = controller_def.target || 'body';
		controller_def.server_events = controller_def.server_events || {};
		
		// create sammy controller
		controller = $.sammy();
		
		// set scope of controller
		controller.element_selector = controller_def.target;
		
		// define routes and events
		$.each( controller_def.routes, function( name, definition){
			if( typeof( definition ) == 'function'){
				controller.bind( name, definition);
			}
			if( typeof( definition ) == 'object'){
				controller.route( definition.method, definition.target, definition.action);
			}
		});

		// define server events
		$.each( controller_def.server_events, function( name, definition){
			if( typeof( definition ) == 'function'){
				controller.bind( name, definition);
			}
		});
		
		// load filters
		var filters = ['before_filters','after_filters','around_filters'];
		
		$.each(filters, function( index, filter_type){
			controller_def[filter_type] = controller_def[filter_type] || {};
			$.each( controller_def[filter_type], function( name, definition){
				if( typeof( definition ) == 'function'){
					controller.before(definition);
				}
				if( typeof( definition ) == 'object'){
					controller.before( definition.options, definition.action);
				}
			});
		});
		
		// load helpers
		if(controller_def.helpers){
			controller.helpers(controller_def.helpers);
		}		

/*		
		if( typeof( controller_def.not_found ) == 'function'){
					controller.notFound = controller_def.not_found;
		}
*/
		
		//initialize controller
		$(function(){
			controller.run();
		});
		
		say.controller[controller_def.name] = controller;
	}
};

// CONFIG
// 
// namespace for application-specific configurations/runtime-evironment variables
//
say.config = {
	model: {
		initialized: false
	}
};

say.cache = {};

return say;
};
