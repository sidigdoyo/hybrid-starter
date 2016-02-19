var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({lazy: true});

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var Q = require('q');

// browserify plugins
var browserify = require('browserify');
var ngAnnotate = require('browserify-ngannotate');
var vinylSource = require('vinyl-source-stream');
var vinylBuffer = require('vinyl-buffer');


// other plugins
var mainBowerFiles = require('main-bower-files'),
	eventStream = require('event-stream');

// custome plugins
var ngHtml2Js = require('./scripts/plugins/ngHtml2Js.custome');

var source = {
	assets: 'app/assets',
	styles: 'app/styles',
	scripts: 'app/scripts'
}

var target = {
	bower: 'bower_components' ,
	styles: 'app/styles',
	dest: 'public',
	fonts: 'public/fonts',
	css: 'public/css',
	// jsmodules: 'public/javascripts/modules',
	// jscomponents: 'public/javascripts/components',
	js: 'public/javascripts',
	i18n: 'public/i18n',
	jslibraries: 'public/javascripts/libraries',
	build: 'build'
};

gulp.task('bower', function() { 
	plugins.bower().pipe(gulp.dest(target.bower)) ;

	var jsFilter = plugins.filter('**/*.js');

	return gulp.src(mainBowerFiles())
		.pipe(jsFilter)
		// .pipe(gulp.dest(target.libraries))
		// .pipe(plugins.ngAnnotate())
		// .pipe(plugins.sourcemaps.init())
		// .pipe(plugins.uglify({
		// 	mangle: true, 
		// 	compress: true, 
		// 	output: {
		// 		beautify: true
		// }}))
		// .pipe(plugins.sourcemaps.write())
		.pipe(gulp.dest(target.jslibraries))
});

// copy assets directory
gulp.task('assets', function() {
	return gulp.src(['app/assets/**/*']).pipe(gulp.dest(target.dest));
});

// copy required fonts
gulp.task('fonts', function() { 
	return eventStream.merge(
		gulp.src(target.bower + '/fontawesome/fonts/**.*') 
			.pipe(gulp.dest(target.fonts)),
		gulp.src(target.bower + '/ionic/release/fonts/**/**.*')
			.pipe(gulp.dest(target.fonts)) 
	);
	
});

gulp.task('sass', function() { 
	return gulp.src(target.styles + '/**.scss')
		.pipe(plugins.sourcemaps.init({loadMaps: true}))
		.pipe(plugins.sass({
			compass: true, 
			sourcemap: true, 
			// style: 'compressed',
			style: 'expanded',
			sourceComments: 'normal',
			loadtarget: [
				target.styles,
				target.bower + '/fontawesome/scss',
				target.bower + '/compass-mixins/lib',
				target.bower + '/ionic/scss'
			]
		}) 
			.on("error", plugins.notify.onError(function (error) {
				return "Error sass: " + error.message;
			}))) 
		// .pipe(plugins.minifyCss())
		.pipe(plugins.sourcemaps.write())
		.pipe(gulp.dest(target.css)); 
});

function getFolders(dir) {
	return fs.readdirSync(dir).filter(function(file) {
		return fs.statSync(path.join(dir, file)).isDirectory();
	});
}

function getFiles(dir) {
	return fs.readdirSync(dir).filter(function(file) {
		return !fs.statSync(path.join(dir, file)).isDirectory();
	});
}

// generate index.js file
// must be running before task build
gulp.task('indexing', ['lint'], function() {

	var rootScripts = getFolders(source.scripts);
	var templateRequire = _.template('require("./<%= name %>")');
	var templateRoot = _.template('module.exports = angular.module("<%= name %>", <%= deps %>)');
	

	var getDirective = function(fileName, module) {
		var templateDirectives = _.template('.<%= type %>("<%= name %>", require("./<%= jsName %>"))');
		var param = {
			type: '',
			jsName: '',
			name: ''
		};
		param.jsName = fileName.replace('.js', '');
		var part = param.jsName.split('.');

		if(fileName.indexOf('.controller') !== -1) {
			param.type = 'controller';
			param.name = part[0].charAt(0).toUpperCase() + part[0].substr(1) + 'Controller';
		} else {
			param.name = part[0];
		}

		if(fileName.indexOf('.value') !== -1) {
			param.type = 'value';
		}

		if(fileName.indexOf('.constant') !== -1) {
			param.type = 'constant';
		}

		if(fileName.indexOf('.factory') !== -1) {
			param.type = 'factory';
		}

		if(fileName.indexOf('.filter') !== -1) {
			param.type = 'filter';
		}

		if(fileName.indexOf('.service') !== -1) {
			param.type = 'service';
		}

		if(fileName.indexOf('.provider') !== -1) {
			param.type = 'provider';
		}

		if(fileName.indexOf('.directive') !== -1) {
			param.type = 'directive';
		}

		if(fileName.indexOf('.config') !== -1 || fileName.indexOf('.run') !== -1) {
			templateDirectives = _.template('.<%= type %>(require("./<%= jsName %>"))');
		}

		if(fileName.indexOf('.config') !== -1) {
			param.type = 'config';
		}

		if(fileName.indexOf('.run') !== -1) {
			param.type = 'run';
		}


		return templateDirectives(param);
	}

	var muter = function(obj, current, parent) {
		parent = parent || '';
		current = current || '';

		Object.keys(obj).forEach(function(key) {
			if(key !== 'files' && key !== 'path' && typeof obj[key] === 'object') {
				// console.log(key)
				muter(obj[key], key, current);
			}
		});

		// if has path than make index
		if(obj.path) {			
			// modules dependencies
			// from dependencies.json or child module
			var deps = [];

			// get files
			var files = obj.files || [];

			if(files.length > 0 && files.indexOf('dependencies.json') !== -1) {
				// module dependencies from json file
				deps = require(path.join(__dirname, obj.path, 'dependencies.json'));
			}

			var content = '// ' + current + '\n"use strict";\n';

			// iterate files js
			var _content = '';
			files.forEach(function(fileName) {

				if(fileName.indexOf('._') === -1 && fileName.indexOf('.DS_Store') === -1  && fileName.indexOf('index') === -1 && fileName.indexOf('.json') === -1) {
					if(fileName.indexOf('.html') === -1) {
						_content += '\n\t' + getDirective(fileName, current);
					} else {
						content += templateRequire({name: fileName}) + ';\n'
					}
				}
			});

			// if has child module
			var child = [];
			Object.keys(obj).forEach(function(key) {
				if(key !== 'files' && key !== 'path' && typeof obj[key] === 'object') {

					// set child
					child.push(key);
					content += templateRequire({name: key}) + ';\n';

					// child module dependencies
					var childModule = current === 'modules' || current === 'components' ? key : current + '.' + key;
					deps.push(childModule)
				}
			});
			var moduleName = parent === '' || parent === 'modules' || parent === 'components' ? current : parent + '.' + current;
			content += templateRoot({name: moduleName, deps: JSON.stringify(deps)})

			content += _content + ';';

			fs.writeFileSync(path.join(obj.path, 'index.js'), content);
		}
	}
	
	var deferred = Q.defer();
	var maju = function(dir, done) {
		var result = {
			files: []
		};
		fs.readdir(dir, function(err, list) {
			if(err) {
				return done(err);
			}
			var i = 0;
			(function lanjut() {
				var file = list[i++];
				if(!file) {

					return done(null, result);
				}
				var fileName = file;
				file = dir + '/' + file;
				fs.stat(file, function(err, stat) {
					if(stat && stat.isDirectory()) {
						maju(file, function(err, obj) {
							if(fileName !== 'starter') {
								result[fileName] = obj;
								result[fileName].path = file;
							}
							lanjut();
						});
					} else {
						if(fileName !== 'index.js') {
							result.files.push(fileName);
						}
						lanjut();
					}
				});
			})();
		});
	};

	maju(source.scripts, function(err, result) {
		if (err) throw err;
		// console.log(results);
		// console.log(JSON.stringify(result, null, 4));

		muter(result);
		deferred.resolve();
	});

	// return rootMap;
	return deferred.promise;
});


// Lint Task
gulp.task('lint', function() {
	return gulp.src('app/scripts/**/**/*.js')
		.pipe(plugins.jshint())
		// Use gulp-notify as jshint reporter
		.pipe(plugins.notify(function (file) {
			// console.log(file);
			if (file.jshint.success) {
				return false;
			}
			var errors = file.jshint.results.map(function (data) {
				if (data.error) {
					return "(" + data.error.line + ':' + data.error.character + ') ' + data.error.reason;
				}
			}).join("\n");
				return file.relative + " (" + file.jshint.results.length + " errors)\n" + errors;
			})
		);
});

gulp.task('build', ['indexing'], function() {

	return browserify({entries: './app/scripts/modules/starter/starter.js', debug: true})
		.transform(ngHtml2Js({
			module: 'app.templates', // optional module name
			extension: 'html', // optionally specify what file types to look for
			baseDir: "app/scripts", // optionally specify base directory for filename
			prefix: '', // optionally specify a prefix to be added to the filename,
			replace: /\/components\/|\/modules\/|\/view\//g
		}))
		.bundle()
		.on("error", plugins.notify.onError(function (error) {
			console.log(error);
			this.emit('end');
		}))
		.pipe(vinylSource('bundle.js'))
		.pipe(vinylBuffer())
		
		.pipe(plugins.sourcemaps.init({loadMaps: true}))
		.pipe(plugins.ngAnnotate()) // annotate 
	    .pipe(plugins.uglify({ // uglify
			mangle: false, 
			compress: false, 
			output: {
				beautify: true
			}
		}))
		.pipe(plugins.sourcemaps.write())
		.pipe(gulp.dest(target.js));
});


// Watch Files For Changes
gulp.task('watch', function() {
	// plugins.livereload.listen();
	gulp.watch(['app/scripts/**/**/*.js', 'app/scripts/**/**/*.html', 'app/scripts/**/**/*.json', '!app/scripts/**/**/index.js'], ['build']);

	gulp.watch('app/styles/**/**/*.scss', ['sass']);
	gulp.watch('app/assets/**/**/*.*', ['assets']);
});

gulp.task('serve', function() {
	// run script as a server
	var server = plugins.liveServer.new('index.js');
	server.start();
});

gulp.task("deploy", ['bower', 'assets', 'fonts', 'sass', 'build']);

gulp.task('default', ['deploy', 'watch'], function() {
	gulp.start('serve');
});


gulp.task('copyPublic', function() {
	return gulp.src(['public/**/**/*']).pipe(gulp.dest('build/www'));
});

