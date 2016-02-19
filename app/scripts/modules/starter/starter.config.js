"use strict";

// @ngInject
var StarterConfig = function($routesProvider, routesConfig) {
	$routesProvider.config({
		routes: routesConfig
	});
};

module.exports = StarterConfig;