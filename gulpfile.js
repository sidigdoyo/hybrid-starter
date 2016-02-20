var gulp = require('gulp');
var config = require("./gulpconfig.json");

// get bower libraries
gulp.task('bower', require('./scripts/task/bower'));

// copy assets directory
gulp.task('assets', require('./scripts/task/assets'));

// copy required fonts
gulp.task('fonts', require('./scripts/task/fonts'));

// generate index.js file
// must be running before task build
gulp.task('indexing', ['lint'], require('./scripts/task/indexing'));

// Lint Task
gulp.task('lint', require('./scripts/task/lint'));

// sass Task
gulp.task('sass', require('./scripts/task/sass'));

// Build Task
gulp.task('build', ['indexing'], require('./scripts/task/build'));

// Watch Files For Changes
gulp.task('watch', function() {
	gulp.watch([
		'app/scripts/**/**/*.js',
		'app/scripts/**/**/*.html', 
		'app/scripts/**/**/*.json', 
		'!app/scripts/**/**/index.js'
	], ['build']);

	gulp.watch('app/styles/**/**/*.scss', ['sass']);
	gulp.watch('app/assets/**/**/*.*', ['assets']);
});

gulp.task('serve', require('./scripts/task/serve'));

gulp.task("deploy", ['bower', 'assets', 'fonts', 'sass', 'build']);

gulp.task('default', ['deploy', 'watch'], function() {
	gulp.start('serve');
});

gulp.task('copyPublic', function() {
	return gulp.src(['public/**/**/*']).pipe(gulp.dest('build/www'));
});
