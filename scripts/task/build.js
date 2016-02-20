var gulp = require('gulp');
var config = require("../../gulpconfig.json");
var plugins = require('gulp-load-plugins')({lazy: true});
var path = require('path');

// custome plugins
var ngHtml2Js = require('../plugins/ngHtml2Js.custome');

var browserify = require('browserify');
var ngAnnotate = require('browserify-ngannotate');
var vinylSource = require('vinyl-source-stream');
var vinylBuffer = require('vinyl-buffer');

var buildTask = function() {
	return browserify({
			entries: path.join(process.cwd(), config.browserify.entries),
			debug: config.browserify.debug
		})
		.transform(ngHtml2Js({
			module: 'app.templates', // optional module name
			extension: 'html', // optionally specify what file types to look for
			baseDir: "app/scripts", // optionally specify base directory for filename
			prefix: '', // optionally specify a prefix to be added to the filename,
			replace: /\/components\/|\/modules\/|\/view\//g
		}))
		.bundle()
		.on("error", plugins.notify.onError(function(error) {
			console.log(error);
			this.emit('end');
		}))
		.pipe(vinylSource('bundle.js'))
		.pipe(vinylBuffer())
		.pipe(plugins.sourcemaps.init({ loadMaps: true }))
		.pipe(plugins.ngAnnotate()) // annotate 
		.pipe(plugins.uglify(config.uglify))
		.pipe(plugins.sourcemaps.write())
		.pipe(gulp.dest(path.join(process.cwd(), config.dir.dest.public.js)));
};

module.exports = buildTask;
