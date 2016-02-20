var gulp = require('gulp');
var config = require("../../gulpconfig.json");
var plugins = require('gulp-load-plugins')({
	lazy: true
});
var mainBowerFiles = require('main-bower-files');

var bowerTask = function() { 
	var jsFilter = plugins.filter('**/*.js');
	plugins.bower().pipe(gulp.dest(config.dir.bower)) ;
	return gulp.src(mainBowerFiles())
		.pipe(jsFilter)
		.pipe(gulp.dest(config.dir.dest.public.libs));
};

module.exports = bowerTask;
