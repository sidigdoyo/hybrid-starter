var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({lazy: true});
var path = require('path');

var serveTask = function() {
	// run script as a server
	var server = plugins.liveServer.new(path.join(process.cwd(), 'index.js'));
	server.start();
};

module.exports = serveTask;