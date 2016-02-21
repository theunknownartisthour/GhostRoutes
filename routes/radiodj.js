var radiodj		= require('../controllers/radiodj'),
    config      = require('../config'),
    express     = require('express'),

    radiodjRoutes;
	
radiodjRoutes = function (middleware) {
    var router = express.Router(),
        subdir = config.paths.subdir,
        routeKeywords = config.routeKeywords;
	
	router.get('/upnext',radiodj.eta);
	
	router.get('/myrequests/upcoming/*',radiodj.upcoming);
	
	router.get('/myrequests/*',radiodj.requestqueue);
	
	router.get('/last/:limit',radiodj.history);
	
	router.get('/request/:songid/:name/:message',radiodj.request);
	
	router.get('/search/:artist/:title/:album',radiodj.search);
	
	router.get('/search/:artist/:title',radiodj.search);
	
	router.get('/search/',radiodj.preview);
	
	router.get('/song/:songid',radiodj.search);
	
	router.get('/artist/:artist',radiodj.search);
	
	router.get('/title/:title',radiodj.search);
	
	router.get('/album/:album',radiodj.search);
	
);

module.exports = radiodjRoutes;