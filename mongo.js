var async = require('async');
var faker = require('Faker');
var mongojs = require('mongojs');
var db = mongojs('test',["test","team"]);

var self = {};

self.insert = function(dataSize,done){
	var run = [];

	run.push(function(callback){
		db.test.remove({},callback);
	})

	run.push(function(callback){
		db.team.remove({},callback);
	})

	run.push(function(callback){
		db.team.createIndex({id:1},callback);
	});

	run.push(function(callback){
		db.test.createIndex({team:1},callback);
	});

	for(var i=0;i<dataSize;i++){
		run.push(function(callback){
			db.test.insert({
				player:faker.Name.findName(),
				email:faker.Internet.email(),
				score:Math.floor(Math.random()*1000),
				team:Math.floor(Math.random()*dataSize),
			},callback);
		});

		run.push(function(callback){
			db.team.count({},function(err,data){
				db.team.insert({
					city:faker.Address.city(),
					country:faker.Address.ukCountry(),
					id:data,
					name:faker.Company.companyName().split(" ")[0].split(",")[0]
				},callback);
			})
		});
	}

	console.time('mongo insert');
	async.series(run,function(err,data){
		// console.log(err);
		console.timeEnd('mongo insert');

		if(done) done();
	});
}

self.find = function(dataSize,done){
	var run = [];

	var players = {};
	var teams = {};

	run.push(function(callback){
		// get test
		db.test.find({},function(err,data){
			players = data;
			callback();
		});
	});

	run.push(function(callback){
		// get team
		db.team.find({}, {'id':1, 'name':1},function(err,data){
			data.forEach(function(team){
				teams[team.id] = team.name;
			});
			callback();
		});
	});

	run.push(function(callback){
		// map
		//players.forEach(function(player){
		//	player_name = player.player;
		//	team_name = teams[player.team];
		//	//console.log(player_name + ', ' + team_name);
		//});
		callback();
	});

	console.time('mongo select');
	async.series(run,function(err,data){
		// console.log(err);
		console.timeEnd('mongo select');

		if(done) done();
	});

	// NOT FAIR for mongo!!
	//db.test.find({},function(err,data){
	//	data.forEach(function(player){
	//		run.push(function(callback){
	//			db.team.find({id:player.team},function(err,data){
	//				//if(!data[0].name) console.log('mongo error : team no name');
	//				callback();
	//			})
	//		});
	//	});
	//
	//	async.series(run,function(err,data){
	//		// console.log(err);
	//		console.timeEnd('mongo select');
	//		if(done) done();
	//	});
	//});
}


module.exports = function(type,dataSize,done){
	return self[type](dataSize,done);
}
