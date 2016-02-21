**Radiodj**

First add a non-local user 'mysqlUSERNAME'@'%' with read permissions to your radiodj's mysql database

Then add your respective mysql details into your config.js like so:

        production: {
            ...
            paths: {
                ...
            },
			radiodj: {
				connectionLimit : 100,
				host : 'mysqlURLorIP',
				port : 3306,
				user : 'mysqlUSERNAME',
				password : 'mysqlPASSWORD',
				database : 'radiodj161'
			}
        }
        
Requires you to add:
    preview.hbs
    results.hbs
    timeofarrival.hbs

REST API:

    /*Gets your list of upcoming songs and also includes their ETA*/
	router.get('/upnext',radiodj.eta);
	
    /*Similar to the above, exclusively checks user's requests*/
	router.get('/myrequests/upcoming/*',radiodj.upcoming);
	
    /*Returns list of user's requested songs (checked against IP)*/
	router.get('/myrequests/*',radiodj.requestqueue);
	
    /*Returns the last number of songs played*/
	router.get('/last/:limit',radiodj.history);
	
    /*Requests a song with a username and message (implictly checks IP)*/
	router.get('/request/:songid/:name/:message',radiodj.request);
	
    /*Searches song list for a match*/
	router.get('/search/:artist/:title/:album',radiodj.search);
	
	router.get('/search/:artist/:title',radiodj.search);
	
	router.get('/song/:songid',radiodj.search);
	
	router.get('/artist/:artist',radiodj.search);
	
	router.get('/title/:title',radiodj.search);
	
	router.get('/album/:album',radiodj.search);
    
    /*Returns a list of artists that are enabled in your library*/
    router.get('/search/',radiodj.preview);