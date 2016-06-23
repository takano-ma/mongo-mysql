var async = require('async');
// var timer = require('./timer');
var self = {};

self.before = function(dataSize,done){
	var mysql = require('mq-node')({
		host     : 'localhost',
		user     : 'root',
		password : '',
	});

	var run = [];

	run.push(function(callback){
		mysql.connection.connect(function(err){
			callback();
		});
	})

	run.push(function(callback){
		mysql.query('CREATE DATABASE IF NOT EXISTS test',function(data,err){
			callback();
		});
	})

	run.push(function(callback){
		mysql.connection.changeUser({database:'test'},function(data,err){
			callback();
		});
	})

	run.push(function(callback){
		mysql.query('DROP TABLE test',function(data,err){
			callback();
		});
	});

	run.push(function(callback){
		mysql.query('DROP TABLE team',function(data,err){
			callback();
		});
	});

	run.push(function(callback){
		mysql.query('CREATE TABLE IF NOT EXISTS test ('+
			'id int(11) NOT NULL AUTO_INCREMENT,'+
			'player varchar(32) NOT NULL,'+
			'score int(11) NOT NULL,'+
			'email varchar(64) NOT NULL,'+
			'team int(10) unsigned NOT NULL,'+
			'PRIMARY KEY (id),'+
			'KEY team (team)'+
		')',function(err,data){
			callback();
		});
	});

	run.push(function(callback){
		mysql.query('CREATE TABLE IF NOT EXISTS team ('+
			'id int(11) NOT NULL AUTO_INCREMENT,'+
			'name varchar(32) NOT NULL,'+
			'country varchar(32) NOT NULL,'+
			'city varchar(32) NOT NULL,'+
			'PRIMARY KEY (id)'+
		')',function(err,data){
			callback();
		});
	});

	//console.time('mysql before')
	async.series(run,function(err,data){
		//console.timeEnd('mysql before');
		mysql.end();
		if(done) done();
	});
}


self.insert = function(dataSize,done){
	var mysql = require('mq-node')({
		host     : 'localhost',
		user     : 'root',
		password : '',
	});

	var run = [];

	var testInsertData = require('./index').testInsertData;
	var teamInsertData = require('./index').teamInsertData;
	var testInsertCounter = 0;
	var teamInsertCounter = 0;

	run.push(function(callback){
		mysql.connection.changeUser({database:'test'},function(data,err){
			callback();
		});
	});

	for(var i=0;i<dataSize;i++){
		run.push(function(callback){
			mysql.insert('test', testInsertData[testInsertCounter], function(err,data){
				testInsertCounter++;
				callback();
			});
		});

		run.push(function(callback){
			mysql.insert('team', teamInsertData[teamInsertCounter], function(err,data){
				teamInsertCounter++;
				callback();
			});
		});
	}

	console.time('mysql insert')
	async.series(run,function(err,data){
		console.timeEnd('mysql insert');
		mysql.end();
		if(done) done();
	});
}


self.insertParallel = function(dataSize,done){
	var mysql = require('mq-node')({
		host     : 'localhost',
		user     : 'root',
		password : '',
	});

	var testInsertData = require('./index').testInsertData;
	var teamInsertData = require('./index').teamInsertData;

	var inserts = [];
	for(var i=0;i<dataSize;i++){
		inserts.push({
			table: 'test',
			data: testInsertData[i]
		});
		inserts.push({
			table: 'team',
			data: teamInsertData[i]
		});
	}

	var AsyncInsert = {
		insert: function(item, callback){
			mysql.insert(item.table, item.data, function(err, data) {
				callback();
			});
		},
	};

	mysql.connection.changeUser({database:'test'},function(data,err){
		console.time('mysql insert parallel');
		async.map(inserts, AsyncInsert.insert.bind(AsyncInsert), function(err,data){
			// console.log(err);
			console.timeEnd('mysql insert parallel');

			if(done) done();
		});
	});
}


self.find = function(dataSize,done){
	var mysql = require('mq-node')({
		host     : 'localhost',
		user     : 'root',
		password : '',
	});

	var run = [];

	run.push(function(callback){
		mysql.connection.changeUser({database:'test'},function(data,err){
			callback();
		});
	});

	run.push(function(callback){
		mysql.select({
			from:['test as t1','team as t2'],
			cols:['player','name'],
			where:'t2.id=t1.team'
		},function(err,data){
			//console.log(data);
			// for(var i in data) console.log(data[i]['player']+" : "+data[i]['name'])
			//for(var i in data) if(!data[i]['name']) console.log('mysql error : team no name');
			callback();
		})
	});

	console.time('mysql select')
	async.series(run,function(err,data){
		console.timeEnd('mysql select');
		mysql.end();
		if(done) done();
	});
}

module.exports = function(type,dataSize,done){
	return self[type](dataSize,done);
}
