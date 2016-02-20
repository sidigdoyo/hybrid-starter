var gulp = require('gulp');
var config = require("../../gulpconfig.json");
var plugins = require('gulp-load-plugins')({
	lazy: true
});

var lintTask = function() {
	return gulp.src('app/scripts/**/**/*.js')
		.pipe(plugins.jshint())
		// Use gulp-notify as jshint reporter
		.pipe(plugins.notify(function(file) {
			// console.log(file);
			if (file.jshint.success) {
				return false;
			}
			var errors = file.jshint.results.map(function(data) {
				if (data.error) {
					return "(" + data.error.line + ':' + data.error.character + ') ' + data.error.reason;
				}
			}).join("\n");
			return file.relative + " (" + file.jshint.results.length + " errors)\n" + errors;
		}));
};

module.exports = lintTask;
