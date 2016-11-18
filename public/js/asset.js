// todo.js
var app = angular.module('digitalbutler');

app.controller('assetController',['$scope', '$http', function todoController($scope, $http) {
    $scope.formData = {};
    $scope.showResult=false;

    // when landing on the page, get all todos and show them
    $scope.getAllAssets = function() {
    $http.get('/api/assets')
        .success(function(data) {
            $scope.assets = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    }
   
    $scope.getAllAssets();
}])