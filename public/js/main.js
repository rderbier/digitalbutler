/**
 * AngularJS Tutorial 1
 * @author Nick Kaye <nick.c.kaye@gmail.com>
 */

/**
 * Main AngularJS Web Application
 */
var app = angular.module('digitalbutler', [
  'ngRoute','schemaForm', 'ui.bootstrap'
]);

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
    // Home
    .when("/", {templateUrl: "partials/landing.html", controller: "PageCtrl"})
    // Pages
    .when("/todos", {templateUrl: "partials/todo.html", controller: "todoController"})
    .when("/location", {templateUrl: "partials/asset.html", controller: "assetController"})
    .when("/groups", {templateUrl: "partials/groups.html", controller: "groupsController"})
    .when("/help", {templateUrl: "partials/help.html", controller: "PageCtrl"})
    .when("/pricing", {templateUrl: "partials/pricing.html", controller: "PageCtrl"})
    .when("/services", {templateUrl: "partials/services.html", controller: "PageCtrl"})
    .when("/contact", {templateUrl: "partials/contact.html", controller: "PageCtrl"})
    // Blog
    .when("/register", {templateUrl: "partials/register.html"})
    .when("/blog/post", {templateUrl: "partials/blog_item.html", controller: "BlogCtrl"})
    // else 404
    .otherwise("/404", {templateUrl: "partials/404.html", controller: "PageCtrl"});
}]);

/**
 * homecontrol
 */
app.controller('mainCtrl',  function mainCtrl($scope, $location, $http) {
    console.log("mainCtrl started");
      // when landing on the page, get all todos and show them
    $http.get('/api/userinfo')
        .success(function(data) {

            $scope.userinfo = data;
            
        })
        .error(function(data) {
            $scope.userinfo={login: false}
            $location.path("/");
            console.log('Error: ' + data);
        });

  $scope.command="";
  $scope.alert=undefined;
  $scope.closeAlert = function () {
    $scope.alert=undefined;
  }

  $scope.sendCommand = function() {
    // !!! use this instead of $Scope as with are using nested controllers 
    console.log("Sending command "+this.command);
    $scope.showResult=false;
        $http.get('/command', {params: { command: this.command} }).success(function(data) {

                $scope.command = ""; // clear the form so our user is ready to enter another
                $scope.alert = {msg: data.message};
                $scope.context = data.context;
                $scope.page=data.page;
                if (data.getit==true) {
                  $location.path(data.page);
                } else {
                  $location.path('help');
                }
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };
}
);

/**
 * Controls all other Pages
 */
app.controller('PageCtrl', function PageCtrl($scope, $location, $http) {
  console.log("Page Controller started");

});