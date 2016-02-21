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

Add your routes as middleware, edit \core\server\middleware\index.js
Like so:

    // ### Routing
    // Set up API routes
    blogApp.use(routes.apiBaseUri, routes.api(middleware));

    // Mount admin express app to /ghost and set up routes
    adminApp.use(middleware.redirectToSetup);
    adminApp.use(routes.admin());
    blogApp.use('/ghost', adminApp);

    // Set up Frontend routes
    blogApp.use(routes.frontend(middleware));
    
    // Set up RadioDJ
    blogApp.use(routes.radiodj(middleware));
    // Set up PaypalIPN
    blogApp.use(routes.paypal(middleware));
    
    // ### Error handling
    // 404 Handler
    blogApp.use(errors.error404);

    // 500 Handler
    blogApp.use(errors.error500);
 