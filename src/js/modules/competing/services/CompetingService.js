define(['./_module'], function (app) {

	'use strict';

	return app.provider('CompetingService', function () {

		this.$get = [
			'$http', 'urls', 'UrlBuilder',
			function ($http, urls, urlBuilder) {

				return {
					subscriptions: function () {
						var url = urlBuilder.build(urls.competing.subscriptions);
						return $http.get(url);
					},
					subscriptionDetail: function(subscriptionId, groupName){
						var url = urlBuilder.build(urls.competing.subscriptionDetails, subscriptionId, groupName);
						return $http.get(url);	
					}
				};
			}
		];
    });
});