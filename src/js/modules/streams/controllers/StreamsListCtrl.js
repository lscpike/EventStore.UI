define(['./_module'], function (app) {

    'use strict';

    return app.controller('StreamsListCtrl', [
		'$scope', '$state', 'StreamsService','$window',
		function ($scope, $state, streamsService, $window) {
			
			function filter (entries) {
				var filtered = {}, i = 0, length = entries.length, item, result = [];

				for(; i<length; i++) {
					if(entries[i].streamId){
						item = entries[i];
						filtered[item.streamId] = true;
					}
				}

				for (item in filtered) {
					result.push({ streamId: item });
				}

				return result;
			}

			$scope.search = '$all';

			$scope.gotoStream = function ($event) {
				$event.preventDefault();
				$event.stopPropagation();

				// todo: do check if stream exists

				$state.go('^.item.events', { streamId: $scope.search });
			};

			function streamExistInCollection(streams, streamId){
				for(var index in streams){
					if(streams[index].streamId == streamId){
						return true;
					}
				}
				return false;
			}

			function addStreamToCollection(streams, stream){
				if(!streamExistInCollection(streams, stream.streamId)){
					stream.pinned = true;
					streams.push(stream);
				}
				return streams;
			}

			function removeStreamFromCollection(streams, stream){
				for(var index in streams){
					if(streams[index].streamId == stream.streamId){
						streams.splice(index, 1);
						return index;
					}
				}
				return -1;
			}

			function getStreamsFromStorage(streamContext){
				var streamsForContext = $window.localStorage.getItem(streamContext);
				if(!streamsForContext){
					return [];
				}else{
					return JSON.parse(streamsForContext);
				}
			}

			function unique(arr){
				var a = arr.concat();
			    for(var i=0; i<a.length; ++i) {
			        for(var j=i+1; j<a.length; ++j) {
			            if(a[i].streamId === a[j].streamId)
			                a.splice(j--, 1);
			        }
			    }

			    return a;
			}

			function mergeWithPinnedStreams(streamContext, streamsToMerge){
				var streamsForContext = getStreamsFromStorage(streamContext);
				var mergedStreams = streamsForContext.concat(streamsToMerge);
				var uniqueStreams = unique(mergedStreams);
				return unique(mergedStreams);
			}

			$scope.pinStream = function (streamContext, stream) {
				var streamsForContext = getStreamsFromStorage(streamContext);
				streamsForContext = addStreamToCollection(streamsForContext, stream);
				$window.localStorage.setItem(streamContext, JSON.stringify(streamsForContext));
				$scope[streamContext] = mergeWithPinnedStreams(streamContext, $scope[streamContext])
			};

			$scope.unpinStream = function (streamContext, stream){
				var streamsForContext = getStreamsFromStorage(streamContext);
				var removedIndex = removeStreamFromCollection(streamsForContext, stream);
				$scope[streamContext][removedIndex].pinned = false;
				$window.localStorage.setItem(streamContext, JSON.stringify(streamsForContext));
				// if(removedIndex != -1){
				// 	$scope[streamContext][removedIndex].pinned = false;
				// }
				// $scope[streamContext] = mergeWithPinnedStreams(streamContext, $scope[streamContext]);
			}

			streamsService.recentlyChangedStreams()
			.success(function (data) {
				$scope.changedStreams = filter(data.entries);
				$scope.changedStreams = mergeWithPinnedStreams('changedStreams', $scope.changedStreams);
			});

			streamsService.recentlyCreatedStreams()
			.success(function (data) {
				$scope.createdStreams = filter(data.entries);
				$scope.createdStreams = mergeWithPinnedStreams('createdStreams', $scope.createdStreams);
			});
		}
	]);
});

