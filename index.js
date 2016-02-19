
var express = require('express'),
	bodyParser = require('body-parser'),
	// jwt = require('jsonwebtoken')
	// cookieParser = require('cookie-parser'),
	// config = require('./scripts/api/config'),
	// apiRoutes = require('./scripts/api/routes'),
	// authentication = require('./scripts/api/authentication'),
	// session = require('express-session'),
	app = express(),
	server = require('http').Server(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
// app.use(cookieParser());
// app.set('secret', config.secret);
app.set('port', process.env.PORT || 9999);
app.use(express.static(__dirname + '/public'));
// app.use(session({
// 	secret: config.secret,
// 	resave: false,
// 	saveUninitialized: true,
// 	cookie: config.cookie
// }));
// app.use('/secure', apiRoutes);
app.use(function(req, res) {
	// res.cookie('x-access-token', authentication.getAccessToken(config.secret), config.cookie);
	res.sendFile(__dirname + '/public/index.html');
});

server.listen(app.get('port'), function() {
	console.log('Frontend development webserver listening on port %d', server.address().port);
});
