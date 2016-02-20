var gulp = require('gulp');
var config = require("../../gulpconfig.json");
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var Q = require('q');

var getFolders = function(dir) {
	return fs.readdirSync(dir).filter(function(file) {
		return fs.statSync(path.join(dir, file)).isDirectory();
	});
};

var getFiles = function(dir) {
	return fs.readdirSync(dir).filter(function(file) {
		return !fs.statSync(path.join(dir, file)).isDirectory();
	});
};

var indexingTask = function() {
	// var rootScripts = getFolders(config.dir.app.scripts);
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

		if (fileName.indexOf('.controller') !== -1) {
			param.type = 'controller';
			param.name = part[0].charAt(0).toUpperCase() + part[0].substr(1) + 'Controller';
		} else {
			param.name = part[0];
		}

		if (fileName.indexOf('.value') !== -1) {
			param.type = 'value';
		}

		if (fileName.indexOf('.constant') !== -1) {
			param.type = 'constant';
		}

		if (fileName.indexOf('.factory') !== -1) {
			param.type = 'factory';
		}

		if (fileName.indexOf('.filter') !== -1) {
			param.type = 'filter';
		}

		if (fileName.indexOf('.service') !== -1) {
			param.type = 'service';
		}

		if (fileName.indexOf('.provider') !== -1) {
			param.type = 'provider';
		}

		if (fileName.indexOf('.directive') !== -1) {
			param.type = 'directive';
		}

		if (fileName.indexOf('.config') !== -1 || fileName.indexOf('.run') !== -1) {
			templateDirectives = _.template('.<%= type %>(require("./<%= jsName %>"))');
		}

		if (fileName.indexOf('.config') !== -1) {
			param.type = 'config';
		}

		if (fileName.indexOf('.run') !== -1) {
			param.type = 'run';
		}

		return templateDirectives(param);
	}

	var muter = function(obj, current, parent) {
		parent = parent || '';
		current = current || '';

		Object.keys(obj).forEach(function(key) {
			if (key !== 'files' && key !== 'path' && typeof obj[key] === 'object') {
				// console.log(key)
				muter(obj[key], key, current);
			}
		});

		// if has path than make index
		if (obj.path) {
			// modules dependencies
			// from dependencies.json or child module
			var deps = [];

			// get files
			var files = obj.files || [];

			if (files.length > 0 && files.indexOf('dependencies.json') !== -1) {
				// module dependencies from json file
				deps = require(path.join(obj.path, 'dependencies.json'));
			}

			var content = '// ' + current + '\n"use strict";\n';

			// iterate files js
			var _content = '';
			files.forEach(function(fileName) {

				if (fileName.indexOf('._') === -1 && fileName.indexOf('.DS_Store') === -1 && fileName.indexOf('index') === -1 && fileName.indexOf('.json') === -1) {
					if (fileName.indexOf('.html') === -1) {
						_content += '\n\t' + getDirective(fileName, current);
					} else {
						content += templateRequire({ name: fileName }) + ';\n'
					}
				}
			});

			// if has child module
			var child = [];
			Object.keys(obj).forEach(function(key) {
				if (key !== 'files' && key !== 'path' && typeof obj[key] === 'object') {

					// set child
					child.push(key);
					content += templateRequire({ name: key }) + ';\n';

					// child module dependencies
					var childModule = current === 'modules' || current === 'components' ? key : current + '.' + key;
					deps.push(childModule)
				}
			});
			var moduleName = parent === '' || parent === 'modules' || parent === 'components' ? current : parent + '.' + current;
			content += templateRoot({ name: moduleName, deps: JSON.stringify(deps) })

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
			if (err) {
				return done(err);
			}
			var i = 0;
			(function lanjut() {
				var file = list[i++];
				if (!file) {

					return done(null, result);
				}
				var fileName = file;
				file = dir + '/' + file;
				fs.stat(file, function(err, stat) {
					if (stat && stat.isDirectory()) {
						maju(file, function(err, obj) {
							if (fileName !== 'starter') {
								result[fileName] = obj;
								result[fileName].path = file;
							}
							lanjut();
						});
					} else {
						if (fileName !== 'index.js') {
							result.files.push(fileName);
						}
						lanjut();
					}
				});
			})();
		});
	};

	maju(path.join(process.cwd(), config.dir.app.scripts), function(err, result) {
		if (err) throw err;
		// console.log(results);
		// console.log(JSON.stringify(result, null, 4));

		muter(result);
		deferred.resolve();
	});

	// return rootMap;
	return deferred.promise;
};

module.exports = indexingTask;
