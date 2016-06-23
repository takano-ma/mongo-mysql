var async = require('async');
// var timer = require('./timer');

var self = {};

self.before = function(dataSize,done){
	var mysql = require('mq-node')({
		host     : 'localhost',
		user     : 'root',
		password : 'vagrant',
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
		mysql.query('DROP TABLE test_json',function(data,err){
			callback();
		});
	});

	run.push(function(callback){
		mysql.query('DROP TABLE team_json',function(data,err){
			callback();
		});
	});

	run.push(function(callback){
		mysql.query('CREATE TABLE IF NOT EXISTS test_json ('+
			'id int(11) NOT NULL AUTO_INCREMENT,'+
			'data JSON,'+
			'PRIMARY KEY (id)'+
		')',function(err,data){
			callback();
		});
	});

	run.push(function(callback){
		mysql.query('CREATE TABLE IF NOT EXISTS team_json ('+
			'id int(11) NOT NULL AUTO_INCREMENT,'+
			'data JSON,'+
			'PRIMARY KEY (id)'+
		')',function(err,data){
			callback();
		});
	});

	run.push(function(callback){
		mysql.query('alter table test_json '+
			'add column team_id int '+
			'generated always as ( JSON_EXTRACT( data, "$.team" ) ) virtual',
		function(err,data){
			callback();
		});
	});

	//console.time('mysql-json before')
	async.series(run,function(err,data){
		//console.timeEnd('mysql-json before');
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
			mysql.query('insert into test_json set data=\''+
				JSON.stringify(testInsertData[testInsertCounter]) +
			'\'',function(err,data){
				testInsertCounter++;
				callback();
			});
		});

		run.push(function(callback){
			mysql.query('insert into team_json set data=\''+
				JSON.stringify(teamInsertData[teamInsertCounter]) +
			'\'',function(err,data){
				teamInsertCounter++;
				callback();
			});
		});
	}

	console.time('mysql-json insert')
	async.series(run,function(err,data){
		console.timeEnd('mysql-json insert');
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
			table: 'test_json',
			data: testInsertData[i]
		});
		inserts.push({
			table: 'team_json',
			data: teamInsertData[i]
		});
	}

	var AsyncInsert = {
		insert: function(item, callback){
			mysql.query('insert into ' + item.table + ' set data=\''+
					JSON.stringify(item.data) +
				'\'',function(err,data){
					callback();
				});
		},
	};

	mysql.connection.changeUser({database:'test'},function(data,err){
		console.time('mysql-json insert parallel');
		async.map(inserts, AsyncInsert.insert.bind(AsyncInsert), function(err,data){
			// console.log(err);
			console.timeEnd('mysql-json insert parallel');

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
		mysql.query('select t1.data->"$.player",t2.data->"$.name" '+
			'from test_json as t1, team_json as t2 where t1.team_id=t2.id',
		function(err, data){
			//console.log(data);
			// for(var i in data) console.log(data[i]['player']+" : "+data[i]['name'])
			//for(var i in data) if(!data[i]['name']) console.log('mysql error : team no name');
			//console.log(err);
			callback();
		})
	});

	console.time('mysql-json select')
	async.series(run,function(err,data){
		console.timeEnd('mysql-json select');
		mysql.end();
		if(done) done();
	});
}

module.exports = function(type,dataSize,done){
	return self[type](dataSize,done);
}
