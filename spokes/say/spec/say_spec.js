describe( 'Say.js: A javascript In-Memory MVC framework for creating rich-client web applications', function(){
	var say;

	beforeEach( function(){
		say = new_spokes_application();		
	});

	describe( 'new_spokes_application()', function(){
		describe( 'should create a say namespace', function(){
			
			it( 'say should be defined', function(){
				expect( say ).toBeDefined();
			});
			
			it( 'say.cache should be defined', function(){		
				expect( say.cache ).toBeDefined();
			});	
			
			it( 'say.config should be defined', function(){		
				expect( say.config ).toBeDefined();
			});	
			
			it( 'say.controller should be defined', function(){		
				expect( say.controller ).toBeDefined();
			});	
			
			it( 'say.db should be defined', function(){		
				expect( say.db ).toBeDefined();
			});	
			
			it( 'say.event should be defined', function(){		
				expect( say.event ).toBeDefined();
			});	
			
			it( 'say.model should be defined', function(){		
				expect( say.model ).toBeDefined();
			});	
			
			it( 'say.notify should be defined', function(){		
				expect( say.notify ).toBeDefined();
			});	
			
			it( 'say.view should be defined', function(){		
				expect( say.view ).toBeDefined();
			});	
			
			it( 'say.log should be defined', function(){		
				expect( say.log ).toBeDefined();
			});	
		});	
	});

	describe( 'MODEL HELPERS', function(){

		describe( 'say.model.initialize()', function(){

			beforeEach( function(){
				say.model.initialize();
			});

			describe('should create model lifecycle events', function(){
				it('model_defined should be defined', function(){
					expect(say.notify.model_defined).toBeDefined();
				});
				it('model_created should be defined', function(){
					expect(say.notify.model_created).toBeDefined();
				});
				it('model_updated should be defined', function(){
					expect(say.notify.model_updated).toBeDefined();
				});
				it('model_destroyed should be defined', function(){
					expect(say.notify.model_destroyed).toBeDefined();
				});								
			});
	

			describe('should create an ActiveRecord In-Memory database', function(){
				it('ActiveRecord In-Memory database adapter should be present', function(){
					expect( ActiveRecord.connection.insertEntity ).toBeDefined();
				});
			});
		});
		
		describe( 'say.model.define( model_def )', function(){

			it( 'should define an ActiveRecord model', function(){
				var model_def = {
					name: 'TestModel'
				};

				say.model.define( model_def );

				expect( say.model.TestModel ).toBeDefined();
			});

			it( 'should define attributes', function(){
				var model_def = {
					name: 'TestModel',
					attributes: {
						first_name: '',
						last_name: ''
					}
				};

				say.model.define( model_def );

				test_model = say.model.TestModel.create({first_name:'Joe',last_name:'Blogs'});
				
				expect( test_model.first_name ).toEqual('Joe');
				expect( test_model.last_name ).toEqual('Blogs');				
			});

			it( 'should define functions', function(){
				var model_def = {
					name: 'TestModel',
					functions: {
						example_function : function( value ){
							return value;
						}
					}
				};

				say.model.define( model_def );

				test_model = say.model.TestModel.create();
				
				expect( test_model.example_function('example data') ).toEqual('example data');

			});
			
			describe( 'should define model relationships', function(){
				it( 'has_one associations should be defined', function(){
					var test_model_def = {
						name: 'TestModel',
						has_one: { another_model : 'AnotherModel' }
					};
					say.model.define( test_model_def );
					
					var another_model_def = {
						name: 'AnotherModel',
					};
					say.model.define( another_model_def );
									
					test_model = say.model.TestModel.create();
					
					expect(test_model.buildAnotherModel()).toBeDefined();
					expect(test_model.createAnotherModel()).toBeDefined();
					expect(test_model.getAnotherModel()).toBeDefined();								
					
				});
	
				it( 'belongs_to associations should be defined', function(){
					var test_model_def = {
						name: 'TestModel',
						belongs_to: { another_model : 'AnotherModel' }
					};
					say.model.define( test_model_def );
					
					var another_model_def = {
						name: 'AnotherModel',
					};
					say.model.define( another_model_def );
									
					test_model = say.model.TestModel.create();
					
					expect(test_model.buildAnotherModel()).toBeDefined();
					expect(test_model.createAnotherModel()).toBeDefined();
					expect(test_model.getAnotherModel()).toBeDefined();								
					
				});
				
				it( 'has_many associations should be defined', function(){
					var test_model_def = {
						name: 'TestModel',
						has_many: { another_model : 'AnotherModel' }
					};
					say.model.define( test_model_def );
					
					var another_model_def = {
						name: 'AnotherModel',
					};
					say.model.define( another_model_def );
									
					test_model = say.model.TestModel.create();
					
					expect(test_model.buildAnotherModel()).toBeDefined();
					expect(test_model.createAnotherModel()).toBeDefined();
					expect(test_model.getAnotherModelList()).toBeDefined();				
					expect(test_model.getAnotherModelCount()).toBeDefined();				
					
				});
			});

			describe( 'should define lifecycle events', function(){

				it( 'after_find should be defined', function(){	
					var after_find_callback = jasmine.createSpy(); 
					var model_def = {
						name: 'TestModel',
						
						after_find: after_find_callback
						
					};

					say.model.define( model_def );
	
					expect(after_find_callback).not.toHaveBeenCalled();
					say.model.TestModel.create({});
					var test_model = say.model.TestModel.find();
					expect(after_find_callback).toHaveBeenCalled();

				});

				it( 'before_save should be defined', function(){	
					var before_save_callback  = jasmine.createSpy(); 
					
					var model_def = {
						name: 'TestModel',

						before_save: before_save_callback

					};

					say.model.define( model_def );
					
					expect(before_save_callback).not.toHaveBeenCalled();
					var test_model = say.model.TestModel.create({});
					test_model.save();
					expect(before_save_callback).toHaveBeenCalled();
				});					

				it( 'after_save should be defined', function(){	
					var after_save_callback  = jasmine.createSpy(); 
					var model_def = {
						name: 'TestModel',
						
						after_save: after_save_callback,

					};

					say.model.define( model_def );
					
					expect(after_save_callback).not.toHaveBeenCalled();
					var test_model = say.model.TestModel.create({});
					test_model.save();
					expect(after_save_callback).toHaveBeenCalled();

				});					

				it( 'before_create should be defined', function(){	
					var before_create_callback  = jasmine.createSpy(); 

					var model_def = {
						name: 'TestModel',

						before_create: before_create_callback

					};

					say.model.define( model_def );
					
					expect(before_create_callback).not.toHaveBeenCalled();
					var test_model = say.model.TestModel.create({});
					expect(before_create_callback).toHaveBeenCalled();

				});					

				it( 'after_create should be defined', function(){	
					var after_create_callback  = jasmine.createSpy('after_create_callback'); 
					var model_def = {
						name: 'TestModel',

						after_create: after_create_callback

					};

					say.model.define( model_def );
					
					expect(after_create_callback).not.toHaveBeenCalled();
					var test_model = say.model.TestModel.create({});
					expect(after_create_callback).toHaveBeenCalled();
				});					

				it( 'before_destroy should be defined', function(){	
					var before_destroy_callback  = jasmine.createSpy(); 
					var model_def = {
						name: 'TestModel',

						before_destroy: before_destroy_callback

					};

					say.model.define( model_def );
		
					expect(before_destroy_callback).not.toHaveBeenCalled();
					var test_model = say.model.TestModel.create({});
					test_model.save();
					test_model.destroy();
					expect(before_destroy_callback).toHaveBeenCalled();
					
				});					

				it( 'after_destroy should be defined', function(){	
					var after_destroy_callback  = jasmine.createSpy(); 
					var model_def = {
						name: 'TestModel',

						after_destroy: after_destroy_callback

					};

					say.model.define( model_def );
					
					expect(after_destroy_callback).not.toHaveBeenCalled();
					var test_model = say.model.TestModel.create({});
					test_model.save();
					test_model.destroy();
					expect(after_destroy_callback).toHaveBeenCalled();
				});					

			});
		});

		describe( 'say.model.cache', function(){

			it( 'should refresh the cached results', function(){

			});
		});

		describe( 'say.model.update( updates )', function(){

			it( 'should define a new model', function(){

				say.model.update({ 
					TestModel : { 
						definition : {
							name : 'TestModel'
						}
					}
				});
	
				expect(say.model.TestModel).toBeDefined();
				
			});

			it( 'should update in-memory db table', function(){

				say.model.update({ 
					TestModel : { 
						definition : {
							name : 'TestModel'
						},
						table : [
							{id:1},
							{id:2},
							{id:3}							
						]
					}
				});
	
				expect(say.model.TestModel.count()).toEqual(3);

			});
			
		});

	});
});
