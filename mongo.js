var async = require('async');
var mongojs = require('mongojs');
var db = mongojs('test',["test","team"]);

var self = {};

self.before = function(dataSize,done){
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

	//console.time('mongo before');
	async.series(run,function(err,data){
		// console.log(err);
		//console.timeEnd('mongo before');

		if(done) done();
	});
}

self.insert = function(dataSize,done){
	var run = [];

	var testInsertData = require('./index').testInsertData;
	var teamInsertData = require('./index').teamInsertDataWithId;
	var testInsertCounter = 0;
	var teamInsertCounter = 0;

	for(var i=0;i<dataSize;i++){
		run.push(function(callback){
			db.test.insert(testInsertData[testInsertCounter], function(err, data) {
				testInsertCounter++;
				callback();
			});
		});

		run.push(function(callback){
			db.test.insert(teamInsertData[teamInsertCounter], function(err, data) {
				teamInsertCounter++;
				callback();
			});
		});
	}

	console.time('mongo insert');
	async.series(run,function(err,data){
		// console.log(err);
		console.timeEnd('mongo insert');

		if(done) done();
	});
}


self.insertParallel = function(dataSize,done){
	var testInsertData = require('./index').testInsertData;
	var teamInsertData = require('./index').teamInsertDataWithId;

	var inserts = [];
	for(var i=0;i<dataSize;i++){
		inserts.push({
			collection: 'test',
			data: testInsertData[i]
		});
		inserts.push({
			collection: 'team',
			data: [i]
		});
	}
	
	var AsyncInsert = {
		insert: function(item, callback){
			db[item.collection].insert(item.data, function(err, data) {
				callback();
			});
		},
	};

	console.time('mongo insert parallel');
	async.map(inserts, AsyncInsert.insert.bind(AsyncInsert), function(err,data){
		// console.log(err);
		console.timeEnd('mongo insert parallel');

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
			//console.log(data);
			data.forEach(function(team){
				teams[team.id] = team.name;
			});
			callback();
		});
	});

	console.time('mongo select');
	async.series(run,function(err,data){
	//async.parallel(run,function(err,data){
		// console.log(err);

		// map
		//players.forEach(function(player){
		//	player_name = player.player;
		//	team_name = teams[player.team];
		//	console.log(player_name + ', ' + team_name);
		//});
		
		console.timeEnd('mongo select');

		if(done) done();
	});
}


module.exports = function(type,dataSize,done){
	return self[type](dataSize,done);
}
