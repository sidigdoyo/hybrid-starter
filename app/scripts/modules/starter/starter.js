"use strict";

angular.module("starter", [
		'ionic',
		"routes.provider",
		require('../../app/config').name,
		require('../../modules/home').name
	])
	.config(require("./starter.config"))
	.run(require("./starter.run"));