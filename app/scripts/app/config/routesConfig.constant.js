"use strict";

var routesConfig = {
	"home": {
		"default": true,
		"views": {
			"root@": {
				"template": "home/home.html",
				"controller": "HomeController as homeCtrl"
			}
		}
	}
};

module.exports = routesConfig;