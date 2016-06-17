var spinner = require("char-spinner");
var async = require("async");
var faker = require('Faker');
spinner();

var dataSize = 10000;

var testInsertData = [];
var teamInsertData = [];

for(var i=0;i<dataSize;i++){
	testInsertData[i] = {
		player:escape(faker.Name.findName()),
		email:escape(faker.Internet.email()),
		team:Math.floor(Math.random()*dataSize),
		score:Math.floor(Math.random()*1000)
	};

	teamInsertData[i] = {
		city:escape(faker.Address.city()),
		country:escape(faker.Address.ukCountry()),
		name:escape(faker.Company.companyName().split(" ")[0].split(",")[0])
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
		require('./mysql')('insert',dataSize,callback);
	},
	function(callback){
		require('./mongo')('insert',dataSize,callback);
	},
	function(callback){
		require('./mysql-json')('insert',dataSize,callback);
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
