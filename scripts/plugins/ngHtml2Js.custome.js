var fs = require('fs'),
    path = require('path'),
    through = require('through'),
    ngHtml2Js = require('ng-html2js'),
    transformify = require('transformify');

function isExtension (file, extension) {
  return new RegExp('\\.' + extension + '$').test(file);
}

ngHtml2jsify.configure = function (filename, opts) {
  if(typeof opts === 'undefined') { // gulp
    return ngHtml2jsify(filename);
  }else{ // CLI
    return ngHtml2jsify(opts)(filename);
  }

};

function ngHtml2jsify(opts) {
  opts = opts|| {};
  opts.module = opts.module || null;
  opts.extension = opts.extension || 'html';
  opts.baseDir = opts.baseDir || null;
  opts.prefix = opts.prefix || '';
  opts.requireAngular = opts.requireAngular || false;
  opts.replace = opts.replace || '';

  var fileMatching = new RegExp("^.*\\" + path.sep + "(.*)$");

  return function (file) {
    if (!isExtension(file, opts.extension)) return through();

    var appDir = process.cwd();

    return transformify(end)();

    function end (content) {
      var fileName = opts.baseDir ? file.replace(path.join(appDir, opts.baseDir), '').replace(/\\/g, '/') : file.match(fileMatching)[1];
      fileName = fileName.replace(opts.replace, '');
      fileName = opts.prefix + fileName;
      content = content.replace(/^\ufeff/g, '');
      var  src = ngHtml2Js(fileName, content, opts.module, 'ngModule') + '\nmodule.exports = ngModule;';
      if (opts.requireAngular) {
        src = 'var angular = require(\'angular\');\n' + src;
      }
      return src;
    }
  };
}

module.exports = ngHtml2jsify.configure;