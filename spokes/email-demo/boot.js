// INITIALIZERS

// first, create a new namespace for your spokes application.
// life is easier if it's a short name, your fingers will 
// thank you.  It's also good to pick one that isn't likely 
// be taken in the global namespace.
//
// for this email demo app, I chose 'eml'. :)
//
var eml = new_spokes_application();

// setup database connection 
//
// after create, you can use eml.db.connect( request = {} ) 
// to connect to the database in your controllers. you can
// call it in your before_filters to seed data into your 
// templates.
eml.db.create({
	host: 'http://10.0.1.191/spokes/email-demo/example_data_2.json',
	adapter: 'ajax'
});
