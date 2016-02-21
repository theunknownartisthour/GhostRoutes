**Installation**

Copy / Paste each folder and merge into respective \core\server\ folder

Modify the index.js file inside \core\server\routes\ to require each new file
Example:
        
    var api         = require('./api'),
        admin       = require('./admin'),
        frontend    = require('./frontend');
    /*Require these files*/
    var	radiodj		= require('./radiodj'),
        paypal		= require('./paypalIPN');
    
    /*Add the requirements into module.exports*/
    module.exports = {
        apiBaseUri: '/ghost/api/v0.1/',
        api: api,
        admin: admin,
        frontend: frontend,
        paypal: paypal,
        radiodj: radiodj
    };

    
 