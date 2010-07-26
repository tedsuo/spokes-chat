// MODELS
//
// ActiveRecord.js in-memory models
//

// Email Model
eml.model.define({

	name: 'Email',

	attributes: {
		sender : '',
		subject : '',
		body : ''
		},
		
	functions: {},
	
	belongs_to: { 
		folder : 'Folder',
		status : 'Status'
		},
	
	beforeCreate: function(){
		eml.log('Creatting a new emailss!!!');
		}
});

// Folder Model
eml.model.define({

	name: 'Folder',
	
	attributes: {
		name: ''
	},
	
	has_many: {
		emails: 'Email',
		child_folders: 'Folder'
	},
	
	has_one: {
		parent_folder: 'Folder'
	}
	
});

// Status Model
eml.model.define({

	name: 'Status',

	attributes: {
		name: '',
		icon: '',
		background_color: '#666666',
		text_color: '#ffffff'
	},

	validates_presence_of: [
		'name',
		'background_color',
		'text_color'
	],
	
	has_many: {
		emails: 'Email'
	}
});
