'use strict';

app.controller('MainCtrl', ['$rootScope', '$scope', 'Window', 'FileReader', function($rootScope, $scope, Window, fr) {
	$rootScope.fileOpened = false;
	$scope.isProcessing = false;
	$scope.fileInfo = {};
	$scope.lines = [];
	$scope.header = [];
	$scope.attrs = {
		startIndex: 1,
		viewLimit: 0,
		selectedFields: []
	};
	
	$scope.fileSelected = function(files){
		//TODO: Reset fr variables if a file is already opened.

		if (files && files.length) {
			$scope.isProcessing = true;
			if($rootScope.fileOpened){
				fr.closeFile();
				$rootScope.fileOpened = false;
				$scope.attrs.startIndex = 1;
				$scope.attrs.viewLimit = 0;
				$scope.attrs.selectedFields = [];
			}
			$scope.fileInfo = files[0];
			console.log("file: " + $scope.fileInfo.path);
			console.log(files[0]);
			fr.setPath($scope.fileInfo.path);
		}
	};

	$rootScope.$on('fileChecked', function(){
		$scope.attrs.viewLimit = Math.min(fr.getNumOfRecords(), 10);
		$scope.lines = fr.parseLines(fr.getSlice($scope.attrs.startIndex, $scope.attrs.startIndex + $scope.attrs.viewLimit));
		$scope.header = fr.getHeader();
		for(var i = 0; i < $scope.header.length; i++){
			$scope.attrs.selectedFields.push({name: $scope.header[i], isSelected: true});
		}
		$rootScope.fileOpened = true;
		$scope.isProcessing = false;
	});

	$scope.$watch(function(scope) { return scope.attrs.startIndex },
		function(newVal, oldVal) {
			console.log(newVal + ", " + oldVal);
			if(newVal && newVal != oldVal){
				$scope.lines = fr.parseLines(fr.getSlice(newVal, newVal + $scope.attrs.viewLimit));
			}
		}
	);

	$scope.seekRecord = function(){
		$scope.attrs.viewLimit += 1;
		$scope.lines.push(fr.parseLine(fr.getLine($scope.attrs.startIndex + $scope.attrs.viewLimit)));
	};

	$scope.changeStartIndex = function(){
		console.log("changeStartIndex(): " + $scope.attrs.startIndex);
		$scope.lines = fr.parseLines(fr.getSlice($scope.attrs.startIndex, $scope.attrs.startIndex + $scope.attrs.viewLimit));
	};

	$scope.changeViewLimit = function(){
		$scope.lines = fr.parseLines(fr.getSlice($scope.attrs.startIndex, $scope.attrs.startIndex + $scope.attrs.viewLimit));
	};

	$scope.cellFilter = function(e){
		return e.isSelected;
	};

	$scope.closeWindow = function(){
		Window.close();
	};
}]);