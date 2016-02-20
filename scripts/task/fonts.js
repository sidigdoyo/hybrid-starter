var gulp = require('gulp');
var config = require("../../gulpconfig.json");
var eventStream = require('event-stream');

var fontsTask = function() { 
	var stream = [];
	Object.keys(config.source.fonts).forEach(function(key, index) {
		stream.push(gulp.src(config.source.fonts[key]) .pipe(gulp.dest(config.dir.dest.public.fonts)));
	});

	return eventStream.merge(stream);
};

module.exports = fontsTask;
