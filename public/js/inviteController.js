// todo.js
var app = angular.module('digitalbutler');

app.controller('inviteController',['$scope', '$rootScope','$http', '$location', function ($scope, $rootScope, $http, $location) {

    $rootScope.menu=[];
    $rootScope.menu.push({label:'new task', fa:'fa-plus-circle', href:'/#/newtask'});
    $rootScope.menu.push({label:'Personal tasks', fa:'fa-list-ul', href:'/#/todos'});
    var groupMap=[];
	var roleMap=[];
	var groupList={};
	$scope.invite={};

 var getGroupDetails = function(groupid) {
 	return ($http.get('/api/group/'+groupid));
 };
 $scope.inviteSchema = {
          "type": "object",
          "title": "TODO",
          "properties": {
              
              "groupid": {"type": "number"},
              "groupName": {"type": "string"},
              "role": { "type": "string" },
              "newrole" :{ "type": "string" },
              "email": { "type": "string" },
              "alias": { "type": "string" }
            },
        "required": ["groupid","email"]
        };

	 var formGroupSelected = function () {
		// after topic and distribution selected, check if next is when or group config
		

	  	if ( $scope.invite.groupid!=undefined) {
			   $scope.invite.groupName=groupList[parseInt($scope.invite.groupid)];
			   //$scope.formphase="execgroup";
			   
			     roleMap.splice(0,roleMap.length);
			   
			   getGroupDetails($scope.invite.groupid).success( function(group) {
				    for (var r in group.roles) {
				     roleMap.push({ value: r, name: r });
				  	} 
				})
	 	}
	}

   $scope.addInvite = function (invite,form) {
   $http.post('/api/invite', invite).success(function(data) {
                              
                  $rootScope.alert.msg="data.email has been invited to join data.group";
                  $rootScope.alert.type="info";
                  $rootScope.newTask=undefined;
                  $location.path("/todos");
                }).error(function(data) {
                  console.log('Error: ' + data);
                  $scope.alert.msg=data.message;
                });
	}

    init = function(groups) {
    	// see what has been parsed to populate the form
  		//
  		var selectedgroup='';
  		if ($rootScope.invite != undefined) {
  			 if ($rootScope.invite.alias!=undefined && $rootScope.invite.alias!='' ) {
  					$scope.invite.alias=$rootScope.invite.alias;
  					$scope.title="You want to invite "+$scope.invite.alias;
  					
  			} 
  			if ($rootScope.invite.groupname!=undefined && $rootScope.invite.groupname!='' ) {
  					selectedgroup=$rootScope.invite.groupname;
  			} 

  		} else {
  			$scope.title="Let's invite someone to one of your groups...";
  		}

    	// build the group map for the form u
    	for (var g in groups) {
    	  	if (groups[g].name != "SELF") {
	    		groupMap.push({ value: groups[g].id, name: groups[g].name });
	    		if (groups[g].name == selectedgroup) {
	    			$scope.invite.groupid=groups[g].id;
	    			$scope.invite.groupName=groups[g].name;
				}
	    		groupList[parseInt($scope.userinfo.groups[g].id)]=$scope.userinfo.groups[g].name;
  			}
  		}
  		  		if ($scope.invite.groupid==undefined && selectedgroup!='') {
  					$scope.message="I don't know any group named "+selectedgroup;
  			} 
  		
	  		  $scope.formInvite = [
	  


					{
					    "title": "Name of the invitee " ,
					    "key": "alias",
					        
					},			    
				    {
					    "title": "Email of the invitee " ,
					    "key": "email"
					    
					    
					},
					{
					    "key": "groupid",
					    "title": "Specify which group :",

					    type: "radios",
					    titleMap: groupMap,
					    onChange: formGroupSelected
				    },
					{
					    "title": "Which role in the group ?" ,
					    "key": "role",
					    type: "radios",
					    titleMap: roleMap,
					    "condition": "invite.email!=undefined"
					    
					  },
					  {
					    "title": "Or define a new role " ,
					    "key": "newrole",
					    "condition": "invite.email!=undefined"
					    
					},
					{
					  type: "actions",
					  condition:"(invite.email!=undefined)",
					  items: [
					  
					  	{ type: "submit", title: "Confirm", style: "btn-info"}

					  ]
					},
			   ]	

    }
    // retireve todos to init the view 
          // when landing on the page, get all todos and show them
    $http.get('/api/userinfo')
        .success(function(data) {

            $scope.userinfo = data;
            init($scope.userinfo.groups);
        
          
            
        })
        .error(function(data) {
            $scope.userinfo={login: false}
            $location.path("/");
            console.log('Error: ' + data);
        });
    
}])