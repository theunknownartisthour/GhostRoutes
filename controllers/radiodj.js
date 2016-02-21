var http = require('http'),
	config = require('../config'),
	mysql = require('mysql'),
	cheerio = require('cheerio'),
	errors = require('../errors'),
	api = require('../api');

var radiodj = mysql.createPool(config.radiodj);

var radiodjHandlers = function(){
	
function request(req,res,next){
	/* SELECT COUNT(*) AS num FROM `requests` WHERE `songID`='$reqsongID' AND `played`=0; */
	/* SELECT COUNT(*) AS num FROM `requests` WHERE `userIP`='$reqIP' AND DATE(`requested`) = DATE(NOW()); */
	/* INSERT INTO `requests` SET `songID`='$reqsongID', `username`='$reqname', `userIP`='$reqIP', `message`='$reqmsg', `requested`=now();" */
	var ip = req.headers['x-forwarded-for'].split(',',1)[0] || 
	req.connection.remoteAddress || 
	req.socket.remoteAddress ||
	req.connection.socket.remoteAddress;
	var songID = req.params.songid;
	var name = req.params.name;
	var message = req.params.message;
	
	var sql = "SELECT SQL_CACHE COUNT(*) AS num FROM requests WHERE songID=? AND played=0";
	var inserts = [songID];
	sql = mysql.format(sql,inserts);
	/*Check if song is already requested*/
	var query = radiodj.query(sql,function(err,result){
		if(err){
			console.log(err);
		}
		
		console.log(result);
		
		if(result[0].num > 0){
			res.error = "Song already is requested";
			res.errorcode = 600;
			console.log(name+":"+ip+" duplicated request for "+songID);
			frontend.results(req,res);
		}
		/*COUNT(*) AS num*/
		/*We are going to count the rows with javascript*/
		var sql2 = "SELECT SQL_CACHE COUNT(*) AS num FROM requests WHERE userIP=? AND DATE(requested) = DATE(NOW())";
		var inserts2 = [ip];
		sql2 = mysql.format(sql2,inserts2);
		/*Check if user hasn't made too many requests*/
		var query2 = radiodj.query(sql2,function(err2,result2){
			if(err2){
				console.log(err2);
			}
			
			console.log(result2);
			
			if(result[0].num > 2){
				res.error = name+", you have too many requests in your queue right now";
				res.errorcode = 601;
				console.log(name+":"+ip+" made too many requests");
				frontend.results(req,res);
			}
		
			/*Insert*/
			var sql3 = "INSERT INTO requests SET songID=?, username=?, userIP=?, message=?, requested=now()";
			var inserts3 = [songID,name,ip,message];
			sql3 = mysql.format(sql3,inserts3);
			
			var query3 = radiodj.query(sql3,function(err3,result3){
				if(err3){
					console.log(err3);
					frontend.results(req,res);
				}
				console.log(result3);
				console.log(result3.insertID);
			});
			res.redirect('/myrequests/');
			/*console.log(query3.sql);*/
		});
		/*console.log(query2.sql);*/
	});
	/*console.log(query.sql);*/
}

function search(req,res,next){
	/*SELECT SQL_CACHE * FROM SONGS WHERE ?*/
	var sql = "SELECT SQL_CACHE * FROM songs WHERE ";
	var sqlmid = "";
	var sqlend = " AND (play_limit = 0 OR count_played < play_limit);";
	/* AND enabled=1 AND song_type=0 */
	var cols = {
		artist: "artist",
		title: "title",
		album: "album",
		id: "songid"
	};
	
	var searchlike = {
		artist: "?? LIKE '%?%'",
		title: "?? LIKE '%?%'",
		album: "?? LIKE '%?%'",
		id: "?? = ?",
		enabled: "?? = ?",
		song_type: "?? = ?"
	}
	
	var inserts = {
		enabled: 1,
		song_type: 0
	};
	
	for(var key in cols){
		if (typeof cols[key] !== 'function') {
			if(req.params[cols[key]]){
				inserts[key] = {};
				inserts[key] = req.params[cols[key]];
				console.log(inserts[key]);
			}
		}
	}
	
	var insertcount = 0;
	for(var key in inserts){
		console.log(key);
		if(typeof inserts[key] !== 'function'){
			if(insertcount != 0){
				/*sqlmid += ' AND '+searchlike[key];*/
				sqlmid += ' AND '+searchlike[key].replace('??',key).replace('?',mysql.escape(inserts[key])).replace("'%'","'%").replace("'%'","%'");
			} else {
				sqlmid += searchlike[key].replace('??',key).replace('?',mysql.escape(inserts[key])).replace("'%'","'%").replace("'%'","%'");
				/*sqlmid += searchlike[key];*/
			}
			console.log(sqlmid);
			insertcount++;
		}
	}
	
	var sqlquery = sql+sqlmid+sqlend;
	console.log(sqlquery);
	//var sqlformatted = mysql.format(sqlquery,inserts);
	var sqlformatted = sqlquery;
	console.log(sqlformatted);
	var query = radiodj.query(sqlformatted,function(err,result){
		if(err){
			console.log(err);
		} else {
			if(req.query.json){
				res.json(result);
			} else {
				res.songlist = result;
				frontend.results(req,res);
			}
		}
	});
	/*console.log(query.sql);*/
}

function requestqueue(req,res,next){
	var ip = req.headers['x-forwarded-for'].split(',',1)[0] || 
	req.connection.remoteAddress || 
	req.socket.remoteAddress ||
	req.connection.socket.remoteAddress;
	
	var sql = "SELECT SQL_CACHE songs.*, requests.songID, requests.username, requests.message, requests.requested, requests.played FROM requests INNER JOIN songs ON requests.songID = songs.ID WHERE requests.userIP="+mysql.escape(ip)+" AND DATE(requests.requested) = DATE(NOW()) ORDER BY requests.ID";
	var query = radiodj.query(sql,function(err,result){
		if(err){
			console.log(err);
		} else {
			if(req.query.json){
				res.json(result);
			} else {
				res.songlist = result;
				frontend.results(req,res);
			}
		}
	});
}

function history(req,res,next){
	var limit = 5;
	if(req.params.limit && req.params.limit > 0){
		limit = req.params.limit;
	} else if(req.query.limit && req.query.limit > 0){
		limit = req.query.limit;
	}
	var sql = "SELECT SQL_CACHE * FROM history WHERE song_type=0 ORDER BY ID DESC LIMIT "+mysql.escape(limit);
	var query = radiodj.query(sql,function(err,result){
		if(err){
			console.log(err);
		} else {
			if(req.query.json){
				res.json(result);
			} else {
				res.songlist = result;
				frontend.results(req,res);
			}
		}
	});
}

function preview(req,res,next){
	var sql = "SELECT SQL_CACHE DISTINCT songs.artist FROM rotations_list JOIN songs ON (songs.id_subcat = rotations_list.subID AND songs.id_genre = rotations_list.genID) WHERE songs.enabled = 1 AND songs.song_type = 0 AND (songs.play_limit = 0 OR songs.count_played < songs.play_limit) ORDER BY songs.artist";
	var query = radiodj.query(sql,function(err,result){
		if(err){
			console.log(err);
		} else {
			if(req.query.json){
				res.json(result);
			} else {
				res.renderpath = 'preview';
				res.songlist = result;
				frontend.results(req,res);
			}
		}
	});
}
/*GROUP BY `artist` HAVING COUNT(*) > 1*/
/*AND ((TIMESTAMPDIFF(MINUTE, `date_played`, NOW()) > $TrackRepeatInterval$)*/
/*AND (TIMESTAMPDIFF(MINUTE, `artist_played`, NOW()) > $ArtistRepeatInterval$))*/
/*ORDER BY `date_played` ASC*/
function upcoming(req,res,next){
	var ip = req.headers['x-forwarded-for'].split(',',1)[0] || 
	req.connection.remoteAddress || 
	req.socket.remoteAddress ||
	req.connection.socket.remoteAddress;
	
	var sql = "SELECT SQL_CACHE songs.*, requests.songID, requests.username, requests.message, requests.requested, requests.played FROM requests INNER JOIN songs ON requests.songID = songs.ID WHERE requests.userIP="+mysql.escape(ip)+" AND DATE(requests.requested) = DATE(NOW()) ORDER BY requests.ID";

	
	var sql = "SELECT SQL_CACHE songs.*, requests.songID, requests.username, requests.message, requests.requested, requests.played FROM queuelist INNER JOIN songs ON queuelist.songID = songs.ID LEFT OUTER JOIN requests ON requests.songID = songs.ID ORDER BY queuelist.ID";
	var query = radiodj.query(sql,function(err,result){
		if(err){
			console.log(err);
			next();
		} else {
			if(req.query.json){
				res.json(result);
			} else {
				res.queuelist = result;
				next();
			}
		}
	});
}

function eta(req,res,next){
		/*songs.date_played*/
		/*songs.duration*/
		/*
		
(
SELECT MAX( ID ) max_id, songID, username, userIP, message, requested, played
FROM requests
WHERE played =0
GROUP BY songID
)
		
		*/
		var saved = {};
		var sql = "SELECT SQL_CACHE artist, title, album, date_played, duration, DATE_ADD( date_played, INTERVAL duration SECOND ) AS date_ended FROM history WHERE song_type=0 ORDER BY ID DESC LIMIT 1";
		var query = radiodj.query(sql,function(err,result){
			if(err){
				console.log(err);
			}
			saved = result[0];
			res.queuelist = result;
			/* Matches songs to requests (even those that have already played)
			var sql2 = "SELECT SQL_CACHE songs . *, requests.played, requests.requested, requests.username FROM queuelist INNER JOIN songs ON queuelist.songID = songs.ID LEFT JOIN requests ON queuelist.songID = requests.songID ORDER BY queuelist.ID";
			*/
			/*Matches songs to requests that have not played*/
			var sql2 = "SELECT SQL_CACHE songs . *, requests.played, requests.requested, requests.username FROM queuelist INNER JOIN songs ON queuelist.songID = songs.ID LEFT JOIN"+ 
			"( SELECT MAX(ID) max_id, songID, username, userIP, message, requested, played FROM requests WHERE played = 0 GROUP BY songID )"+
			"requests ON (queuelist.songID = requests.songID) ORDER BY queuelist.ID"
			var query2 = radiodj.query(sql2,function(err,result){
			if(err){
				console.log(err);
				next();
			} else {
				if(req.query.json){
					res.json(result);
				} else {
					var delay = 0;
					var ndate = new Date(saved.date_ended);
					for(var i = 0; i < result.length; i++){
						result[i].ETA = delay;
						result[i].ETADate = ndate.setSeconds(ndate.getSeconds()+result[i].duration);
						delay += result[i].duration;
					}
					res.renderpath = 'timeofarrival';
					res.songlist = result;
					frontend.results(req,res);
				}
			}
			});
		
		});
}

}

module.exports = radiodjHandlers;