

/**
 * Main AngularJS Web Application
 */
var app = angular.module('digitalbutler', [
  'schemaForm', 'schemaForm-datepicker', 'schemaForm-timepicker', 'schemaForm-datetimepicker','ngRoute','schemaForm', 'ngAnimate','mgcrea.ngStrap'
]);



/**
 * homecontrol
 */
app.controller('mainCtrl',  function mainCtrl($rootScope, $scope, $location, $http) {
    console.log("mainCtrl started");
    $scope.message="test page";
    $scope.task={};
    $scope.selectedDate = "2016-12-22T02:33:21.431Z";

$scope.userdataschema={
          "type": "object",
          "title": "TODO",
          readonly: false, 
          "properties": {
              "customername":  {"type": "string"}
            }
          };

    //$scope.userdataschema=JSON.parse('{ "type": "object", "title": "data","properties":{"customer_name":  {"type": "string"},"entry_date":  {"type": "string"}}}');  
    $scope.taskform=["customername",     {
      type: "actions",
      items: [
      { type: "submit",  title: "Hide this task"}
      ]
    }];
    $scope.userdata={"customername": "test"};
    
    $scope.taskSchema = {
          "type": "object",
          "title": "TODO",

          "properties": {
            "data": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                      "name": { "type": "string" },
                      "fields" : {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties" : {
                            "name": { "type": "string" }
                          }
                        }
                      }
                    }
                  }

              },
            "dueDate":  {"type": "string", "format": "datepicker"}
          }
      };
     
      $scope.taskForm= [

          {
            key : "data",
            title : "test on array",
            disableSuccessState : true,
            items: [
                    { key: "data[].name", disableSuccessState: true, notitle: true },
                    { key: "data[].fields", startEmpty: true,
                      items : [
                        { key: "data[].fields[].name", notitle: true}
                      ] 
                    }
                  ]
                
            

          },
          {
            key : "dueDate",
            title: "test on date?"

          }
      ]
 });


