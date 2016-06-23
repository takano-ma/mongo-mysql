var spinner = require("char-spinner");
var async = require("async");
var faker = require('Faker');
spinner();

var dataSize = 10000;

var testInsertData = [];
var teamInsertData = [];
var teamInsertDataForMongo = [];

for(var i=0;i<dataSize;i++){
	testInsertData[i] = {
		player:escape(faker.Name.findName()),
		email:escape(faker.Internet.email()),
		team:Math.floor(Math.random()*dataSize),
		score:Math.floor(Math.random()*1000)
	};

	var city = escape(faker.Address.city());
	var country = escape(faker.Address.ukCountry());
	var name = escape(faker.Company.companyName().split(" ")[0].split(",")[0]);
	
	teamInsertData[i] = {
		city: city,
		country: country,
		name: name,
	};

	teamInsertDataForMongo[i] = {
		id: i + 1,
		city: city,
		country: country,
		name: name,
	};
}

exports.testInsertData = testInsertData;
exports.teamInsertData = teamInsertData;


async.series([
	function(callback){
		require('./mysql')('before',dataSize,callback);
	},
	function(callback){
		require('./mongo')('before',dataSize,callback);
	},
	function(callback){
		require('./mysql-json')('before',dataSize,callback);
	},

	/* == INSERT == */
	function(callback){
		//require('./mysql')('insert',dataSize,callback);
		require('./mysql')('insertParallel',dataSize,callback);
	},
	function(callback){
		//require('./mongo')('insert',dataSize,callback);
		require('./mongo')('insertParallel',dataSize,callback);
	},
	function(callback){
		//require('./mysql-json')('insert',dataSize,callback);
		require('./mysql-json')('insertParallel',dataSize,callback);
	},
	/* == SELECT == */
	function(callback){
		require('./mysql')('find',dataSize,callback);
	},
	function(callback){
		require('./mongo')('find',dataSize,callback);
	},
	function(callback){
		require('./mysql-json')('find',dataSize,callback);
	}
],function(){
	process.exit();
})
