var config      = require('../config'),
    express     = require('express'),
	api = require('../api');
	
var paypalIPNRoutes;
	
paypalIPNRoutes = function (middleware) {
    var router = express.Router(),
        subdir = config.paths.subdir,
        routeKeywords = config.routeKeywords;

	router.post('/paypal/notification/:sandbox', function(req, res){
		
		console.log('Received POST /');
		console.log(req.body);
		console.log('\n\n');
		
		// assign posted variables to local variables
		var item_name = req.body['item_name'];
		var item_number = req.body['item_number'];
		var payment_status = req.body['payment_status'];
		var payment_amount = req.body['mc_gross'];
		var payment_currency = req.body['mc_currency'];
		var txn_id = req.body['txn_id'];
		var receiver_email = req.body['receiver_email'];
		var payer_email = req.body['payer_email'];
		var payer_status = req.body['payer_status'];
		var address_status = req.body['address_status'];
		var first_name = req.body['first_name'];
		var last_name = req.body['last_name'];
		
		//var note = payer_email+' purchased '+item_name+'#'+item_number+' now '+payment_status+' for '+payment_amount+payment_currency;
		var note = payer_email+'<br>'+item_name+' #'+item_number+'<br>'+payment_status+'<br>'+payment_amount+payment_currency;
		
		var notetype = 'info';
		var status = payment_status.toUpperCase();
		
		if(status == "COMPLETED"){
			notetype = 'success';
		} 
		else if(status == "DENIED"){
			notetype = 'error';
		} 
		else if(status == "EXPIRED"){
			notetype = 'warn';
		} 
		else if(status == "FAILED"){
			notetype = 'error';
		}
		else if(status == "IN-PROGRESS"){
			notetype = 'info';
		}
		else if(status == "PARTIALLY_REFUNDED"){
			notetype = 'info';
		}
		else if(status == "PENDING"){
			notetype = 'info';
		}
		else if(status == "PROCESSED"){
			notetype = 'info';
		}
		else if(status == "REFUNDED"){
			notetype = 'warn';
		}
		else if(status == "REVERSED"){
			notetype = 'warn';
		}
		else if(status == "VOIDED"){
			notetype = 'warn';
		}
		else if(status == "CANCELED_REVERSAL"){
			notetype = 'warn';
		} else {
			notetype = 'info';
		}
		
		
		// type can be 'error', 'success', 'warn' and 'info'
		
		var notification = {
			type: notetype,
			message: note,
			location: 'top',
			dismissible: true
		};
		

		console.log("Adding note: "+note);
		
		var usernote = 'info';
		if(address_status.toUpperCase() == 'UNCONFIRMED'){
			usernote = 'warn';
		} else if(payer_status.toUpperCase() == 'UNVERIFIED'){
			usernote = 'warn';
		}
		
		api.notifications.add({notifications: [{
			type: usernote,
			message: first_name+' '+last_name+':'+payer_email+'<br>Address:'+address_status+'<br>Account:'+payer_status,
		}]}, {context: {internal: true}});
		
		api.notifications.add({notifications: [{
			type: notetype,
			message: note,
		}]}, {context: {internal: true}});

		console.log("Before send");
		
		// STEP 1: read POST data
		req.body = req.body || {};
		res.send(200, 'OK');
		res.end();
		
		console.log("After send");
		/*
		// read the IPN message sent from PayPal and prepend 'cmd=_notify-validate'
		var postreq = 'cmd=_notify-validate';
		for (var key in req.body) {
			if (req.body.hasOwnProperty(key)) {
				var value = querystring.escape(req.body[key]);
				postreq = postreq + "&" + key + "=" + value;
			}
		}

		// Step 2: POST IPN data back to PayPal to validate
		console.log('Posting back to paypal');
		console.log(postreq);
		console.log('\n\n');
		
		var pingbackurl = req.params.sandbox ? "https://www.sandbox.paypal.com/" : "https://www.paypal.com/";
		
		var options = {
			url: pingbackurl,
			path: '/cgi-bin/webscr',
			method: 'POST',
			headers: {
				'Connection': 'close'
			},
			body: postreq,
			strictSSL: true,
			rejectUnauthorized: false,
			requestCert: true,
			agent: false
		};

		request(options, function callback(error, response, body) {
		  if (!error && response.statusCode === 200) {

			// inspect IPN validation result and act accordingly

			if (body.substring(0, 8) === 'VERIFIED'){
				// The IPN is verified, process it
				console.log('Verified IPN!');
				console.log('\n\n');
				
				var note = item_name+' #'+item_number+' now '+payment_status+' for '+payment_amount+payment_currency+':'+payer_email;
				
				var notification = {
					type: 'info',
					message: note,
					location: 'top',
					dismissible: true
				};

				api.notifications.add({notifications: [{
					type: 'info',
					message: note,
				}]}, {context: {internal: true}});
				
				//Lets check a variable
				console.log("Checking variable");
				console.log("payment_status:", payment_status)
				console.log('\n\n');

				// IPN message values depend upon the type of notification sent.
				// To loop through the &_POST array and print the NV pairs to the screen:
				console.log('Printing all key-value pairs...')
				for (var key in req.body) {
					if (req.body.hasOwnProperty(key)) {
						var value = req.body[key];
						console.log(key + "=" + value);
					}
				}

			} else if (body.substring(0, 7) === 'INVALID') {
				// IPN invalid, log for manual investigation
				console.log('Invalid IPN!');
				console.log('\n\n');
			} else {
				console.log('Weird IPN!');
				console.log('\n\n');
			}
		  } else {
			  Console.log("Whoops");
			  console.log(error);
			  console.log(response.statusCode);
		  }
		});
		*/
	});
}

module.exports = paypalIPNRoutes;