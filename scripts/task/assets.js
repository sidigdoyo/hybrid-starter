var gulp = require('gulp');
var config = require("../../gulpconfig.json");

var assetsTask = function() {
	return gulp.src(config.source.assets).pipe(gulp.dest(config.dir.dest.public.root));
};

module.exports = assetsTask;
