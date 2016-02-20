var gulp = require('gulp');
var config = require("../../gulpconfig.json");
var plugins = require('gulp-load-plugins')({lazy: true});
var path = require('path');

var sassTask = function() { 
	return gulp.src(path.join(process.cwd(), config.dir.app.styles, '**.scss'))
		.pipe(plugins.sourcemaps.init({loadMaps: true}))
		.pipe(plugins.sass({
			compass: true, 
			sourcemap: true, 
			// style: 'compressed',
			style: 'expanded',
			sourceComments: 'normal',
			loadtarget: config.sass.load
		}) 
			.on("error", plugins.notify.onError(function (error) {
				return "Error sass: " + error.message;
			}))) 
		// .pipe(plugins.minifyCss())
		.pipe(plugins.sourcemaps.write())
		.pipe(gulp.dest(path.join(process.cwd(), config.dir.dest.public.css))); 
};

module.exports = sassTask;