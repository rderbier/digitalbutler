// todo.js
var app = angular.module('digitalbutler');

app.controller('newtaskController',['$rootScope','$scope', '$http', '$location', function newtaskController($rootScope, $scope, $http, $location) {
  $scope.newformvisible = true;
  $rootScope.menu=[];
  $rootScope.menu.push({label:'Personal tasks', fa:'fa-list-ul', href:'/#/todos'});
  var startRemind = function () { 
   $scope.formphase='reminder';
   $scope.newTask.distribution='PERSO';

 };  
 if ($rootScope.newTask!=undefined) {
   $scope.newTask = $rootScope.newTask;
   $scope.newTask.occurrence = "NOW";
 } else {
   $scope.newTask = {
     occurrence: "NOW"
   };
 }
 if ($scope.newTask.type=="reminder") {
  startRemind();
} else { 
 $scope.formphase="type";
}

var getGroupDetails = function(groupid) {
 return ($http.get('/api/group/'+groupid));

};
var getActions = function(topic) {
 return ($http.get('/api/actions/topic/'+topic));

};
$scope.taskSchema = {
  "type": "object",
  "title": "TODO",
  "properties": {
      "title":  {"type": "string"},
      "description":  {"type": "string"},
      "topic":  {"type": "string"},
      "instance":  {"type": "string"},
      "distribution": {"type": "string", "enum": ["PERSO","GROUP"] },
      "execGroupId": {"type": "number"},
      "execGroupName": {"type": "string"},
      "execGroupRole": { "type": "string" },
      "execUser": { "type": "string" },
      "execGroupChoice": { "type": "string",
      "enum": ["ANY","ROLE","NAMED"]},
      "trigOption": {"type": "string"},
      "trigGroupId": {"type": "number"},
      "trigGroupRole": { "type": "string" },
      "trigUser": { "type": "string" },
      "occurrence": { "type": "string",
      "enum": ["NOW","DATE","EVERYDAY","EVERYWEEK","EVERYMONTH","ATWILL","CHAINED"] },
      "repetitionWeek": {"type": "string"},
      "repetitionMonth": {"type": "integer", "minimum": 1,"maximum": 31},
      "chainedFrom": {"type": "number"},
      "duedate": {"type": "string", "format": "datepicker"},
      "duedatestr" : {"type": "string"},
      "done": { "type": "string" },
      "canupload" : {type: "boolean"},
      "hasStatuses" : {type: "boolean"},
      "endresult" : {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties" : {
                            "label": { "type": "string" }
                          }
                        }
                  },
      "displayfields" : {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties" : {
                            "name": { "type": "string" },
                            "type": { "type": "string" }
                          }
                        }
                  },
      "entryfields" : {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties" : {
                            "name": { "type": "string" },
                            "type": { "type": "string" }
                          }
                        }
                  }
    },
  "required": ["title"]
  };






$scope.taskExplanation = function (task) {
  // create a readable explanation of the task
  var str= " ";
  var days=["","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  if (task.occurrence=='EVERYDAY') {
    str += 'Everyday, '
  }
  if (task.repetitionWeek!=undefined) {
    str += 'Every  '+days[task.repetitionWeek];
  }
  if (task.trigOption=='PERSO') {
    str += "When you will request ";
  }
  str+='I will ask ';
  if (task.execGroupChoice=='ANY') {
    str+='anyone ';
  } else if (task.execGroupRole!=undefined) {
      str+='any '+task.execGroupRole+' ';
  } else if (task.execGroupUser!=undefined) {
     str+=task.execGroupUser+' ';
  } else {
    str+='someone ';
  }
  str+=' from group '+task.execGroupName+' to ';
  if (task.title!= undefined) {
    str+=task.title;
  } else {
    str+='do something.';
  }
  task.explanation=str;
} 




$scope.updateTask = function(task,form) {

  $http.put('/api/todo/'+task.id, task)
  .success(function(data) {

    console.log(data);
    $scope.getTodos();
  })
  .error(function(data) {
    console.log('Error: ' + data);
  });
};
// handling the notifications from thenew task form 
var clearForm = function () {
	$scope.formphase="type";
  $rootScope.newTask=undefined;
  $scope.newTask = {
    occurrence: "NOW"
  };
};
var formDistributionSelected = function () {
	// after topic and distribution selected, check if next is when or group config
	$scope.taskExplanation($scope.newTask);
  
  if ( $scope.newTask.distribution=="PERSO") {
   $scope.formphase="when";
   
 } else {
  $scope.newTask.execGroupId=undefined;

}


}
var formExecGroupSelected = function () {
	// after topic and distribution selected, check if next is when or group config
	

  if ( $scope.newTask.execGroupId!=undefined) {
   $scope.newTask.execGroupName=groupList[parseInt($scope.newTask.execGroupId)];
   //$scope.formphase="execgroup";
   $scope.taskExplanation($scope.newTask);
   execGroupRoleMap.splice(0,execGroupRoleMap.length);
   execGroupUserMap.splice(0,execGroupUserMap.length)

   getGroupDetails($scope.newTask.execGroupId).success( function(group) {
    for (var r in group.roles) {
     execGroupRoleMap.push({ value: r, name: r });
     for ( var m in group.roles[r].members) {
      var u=group.roles[r].members[m];
      if (u.alias) {
       execGroupUserMap.push({ value: u.email, name: u.alias+" - "+r });
     } else {
      execGroupUserMap.push({ value: u.email, name: u.email+" - "+r });
    }

  } 
}

})

 }




}
var formBack = function () { 
	if ($scope.formphase=='topic') {
		$scope.formphase='title';
	} else
	if ($scope.formphase=='when') {
		if ($scope.newTask.distribution=="PERSO") 
			$scope.formphase='topic';
		else
			$scope.formphase='execgroup';
	} else
  if ($scope.formphase=='execgroup') {
    $scope.formphase='topic';
  } else
  if ($scope.formphase=='atwill') {
    $scope.formphase='title';
  }
  else
    if ($scope.formphase=='chained') {
      $scope.formphase='title';
    }
  };
  var formNext = function () { 
   $scope.taskExplanation($scope.newTask);
   if ($scope.formphase=='title') {
		//$scope.newTask.explanation = "Ok, lets configure the task '"+$scope.newTask.title+"'.";
        $scope.formphase='topic';
    } 
    if ($scope.formphase=='atwill') {
    //$scope.newTask.explanation = "Ok, lets configure the task '"+$scope.newTask.title+"'.";
      $scope.formphase='topic';
    } 
};

var startTask = function () { 
 $scope.formphase='title';
 $scope.newTask.distribution='GROUP';
};
var updateExplanation = function () {
  $scope.taskExplanation($scope.newTask);
}
var whenSelected = function () { 
	if ( $scope.newTask.occurrence=="ATWILL") {
    updateExplanation();
		$scope.formphase='atwill';

	} else 
	if ( $scope.newTask.occurrence=="CHAINED") {
      	actionsMap.splice(0,actionsMap.length)
         getActions($scope.newTask.topic).success( function(actions) {
          for (var i in actions) {
             actionsMap.push({ value: actions[i].id, name: actions[i].title});
          }

          });
         $scope.formphase='chained';

        };

};
var trigOptionSelected = function () { 
	if ( $scope.newTask.trigOption=="PERSO") {
		//$scope.formphase='when';
	}
};
var trigGroupChoiceSelected = function () { 
	if ( $scope.newTask.trigGroupChoice=="ANY") {
		//$scope.formphase='when';
	}
};
var trigGroupRoleSelected = function () { 
	if ( $scope.newTask.trigGroupRole!=undefined) {
		//$scope.formphase='when';
	}
};
var trigGroupSelected = function () { 
	
	trigGroupRoleMap.splice(0,trigGroupRoleMap.length)
	getGroupDetails($scope.newTask.trigGroupId).success( function(group) {
    for (var r in group.roles) {
     trigGroupRoleMap.push({ value: r, name: r });

   }

 })
};
// when submitting the add form, send the text to the node API
$scope.addTask = function(task,form) {
  if(task.duedate) {
    task.duedateStr=Date.parse(task.duedate);
  }
  if(task.entryfields && task.entryfields[0].name!=undefined) {
    var fieldProperty='{';
    for (var e in  task.entryfields) {
      // var fname=task.entryfields[e].name.replace(/ /g,"_");
      var fname=task.entryfields[e].name;

        fieldProperty+= '"'+fname+'":  {"type": "string"},';
      // var i="00"+e;
      //fname="f_"+i.substr(-2,2)+"_"+fname;
      // task[fname]="";
    }
    fieldProperty+='}';
    task.userdataschema='{ "type": "object", "title": "data","properties":'+fieldProperty+'}';
    task.taskform='["*"]';
    task.entryfields=null;
  }
  
  if (task.execGroupId!=undefined) {
   task.execGroupName=groupList[parseInt(task.execGroupId)];
 }

 $http.post('/api/todos', task)
 .success(function(data) {
                $scope.newTask = {occurrence: "NOW"}; // clear the form so our user is ready to enter another              
                $rootScope.alert.msg="Task has been created.";
                $rootScope.alert.type="info";
                $rootScope.newTask=undefined;
                $location.path("/todos");
              })
 .error(function(data) {
  console.log('Error: ' + data);
  $scope.alert.msg=data.message;
});
};

var groupMap=  [];
var execGroupRoleMap=[];
var execGroupUserMap=[];
var trigGroupRoleMap=[];
var actionsMap=[];

var groupList={};

init = function() {
  for (var g in $scope.userinfo.groups) {
    groupMap.push({ value: $scope.userinfo.groups[g].id, name: $scope.userinfo.groups[g].name }); 
    groupList[parseInt($scope.userinfo.groups[g].id)]=$scope.userinfo.groups[g].name;
  }


  $scope.taskFormType = [
            { type : "help", helpvalue: "<h2>What do you want me to do ?</h2>" },
            { type: "button", title: "Remind me to do something ", style: "btn-info", onClick: startRemind},
            { type: "button", title: "Ask someone to do something ", style: "btn-info", onClick: startTask}
        ];

  $scope.taskFormReminder = [

  {
    key : "title",
    title: "Ok, will remind you to ... "

  },
  {
    key : "description",
    title: "Any details or instruction ?"

  },
  {
    "condition": "(newTask.title!=undefined)",
    "title": "When should I remind you  ?",
    "key": "occurrence",
    "type": "select",
    "titleMap": [
    {"value": "NOW", "name": "Put it now in my todo list"},
    {"value": "DATE", "name": "on date"},
    {"value": "EVERYDAY", "name": "every day"},
    {"value": "EVERYWEEK", "name": "every week"},
    {"value": "EVERYMONTH", "name": "every month"},
    ],
    "notitle": false,
    onChange: whenSelected
  },
  {
    "condition": "(newTask.distribution=='GROUP')",
    "title": "When do you want people to work on this task ?",
    "key": "occurrence",
    "type": "select",
    "titleMap": [
    {"value": "NOW", "name": "asap"},
    {"value": "DATE", "name": "on date"},
    {"value": "EVERYDAY", "name": "every day"},
    {"value": "EVERYWEEK", "name": "every week"},
    {"value": "EVERYMONTH", "name": "every month"},
    {"value": "ATWILL", "name": "when someone is requesting"},
    {"value": "CHAINED", "name": "when another task is done"},
    ],
    "notitle": false,
    onChange: whenSelected
  },
  {

    "key": "duedate",
    "condition": "newTask.occurrence=='DATE'"
  },
  {

    "key": "repetitionWeek",
    "title":"which day of the week ?",
    "condition": "newTask.occurrence=='EVERYWEEK'",
    "type": "select",
    "titleMap": [
    {"value": "1", "name": "Monday"},
    {"value": "2", "name": "Tuesday"},
    {"value": "3", "name": "Wednesday"},
    {"value": "4", "name": "Thursday"},
    {"value": "5", "name": "Friday"},
    {"value": "6", "name": "Saturday"},
    {"value": "7", "name": "Sunday"},
    ]
  },
  {

    "key": "repetitionMonth",
    "title":"which day of the month ?",
    "condition": "newTask.occurrence=='EVERYMONTH'"


  },
  {
    type: "actions",
    condition:"(newTask.occurrence=='NOW') || (newTask.occurrence=='EVERYDAY') ||(newTask.duedate!=undefined) || (newTask.repetitionWeek!=undefined) || (newTask.repetitionMonth!=undefined)",
    items: [
    { type: "button", title: "Clear", style: "btn-info", onClick: clearForm},
    { type: "submit", title: "Confirm", style: "btn-info" ,icon: "glyphicon glyphicon-icon-exclamation-sign"},

    ]
  },

  {
    type: "actions",
    condition:"!((newTask.occurrence=='NOW') || (newTask.occurrence=='EVERYDAY') ||(newTask.duedate!=undefined) || (newTask.repetitionWeek!=undefined) || (newTask.repetitionMonth!=undefined))",
    items: [
    { type: "button", title: "Clear", style: "btn-info", onClick: clearForm},

    ]
  }
  ];
$scope.taskFormTitle = [
        { type : "help", helpvalue: "<h3>I can ask someone from one of your groups.</h3>" },
        {
          "condition": "newTask.distribution=='GROUP'",
          "key": "execGroupId",
          "title": "Specify which group :",     
          type: "select",
          titleMap: groupMap,
          onChange: formExecGroupSelected
        },
        {
          "title": "Who in the group ?",
          "key": "execGroupChoice",
          "condition": "newTask.execGroupId!=undefined",
          "type": "radios",
          "titleMap": [
          { "value": "ANY","name": "Anyone in the group" },
          { "value": "ROLE","name": "Anyone with specific role" },
          { "value": "NAMED","name": "specific member" },
          ],
          onChange: updateExplanation
        },
        {
          "title": "Which role in the group ?" ,
          "key": "execGroupRole",
          "condition": "newTask.execGroupChoice=='ROLE'",
          type: "select",
          titleMap: execGroupRoleMap
        },
        {
          "title": "Who from the group ?",
          "key": "execGroupUser",
          "condition": "newTask.execGroupChoice=='NAMED'",
          type: "select",
          titleMap: execGroupUserMap  
        },
        
        {
          condition:"((newTask.execGroupUser!=undefined) ||(newTask.execGroupRole!=undefined) || (newTask.execGroupChoice=='ANY'))",
          key : "title",
          title: "What do you want me to ask to do ?",
          onChange: updateExplanation
        },
        {
          condition:"(newTask.title!=undefined)",
          "title": "When do you want people to work on this task ?",
          "key": "occurrence",
          "type": "select",
          "titleMap": [
          {"value": "NOW", "name": "asap"},
          {"value": "DATE", "name": "on date"},
          {"value": "EVERYDAY", "name": "every day"},
          {"value": "EVERYWEEK", "name": "every week"},
          {"value": "EVERYMONTH", "name": "every month"},
          {"value": "ATWILL", "name": "when someone is requesting"},
          {"value": "CHAINED", "name": "when another task is done"},
          ],
          "notitle": false,
          onChange: whenSelected
        },
        {

          "key": "duedate",
          "condition": "newTask.occurrence=='DATE'"
        },
        {

          "key": "repetitionWeek",
          "title":"which day of the week ?",
          "condition": "newTask.occurrence=='EVERYWEEK'",
          "type": "select",
          "titleMap": [
          {"value": "1", "name": "Monday"},
          {"value": "2", "name": "Tuesday"},
          {"value": "3", "name": "Wednesday"},
          {"value": "4", "name": "Thursday"},
          {"value": "5", "name": "Friday"},
          {"value": "6", "name": "Saturday"},
          {"value": "7", "name": "Sunday"},
          ]
        },
        {

          "key": "repetitionMonth",
          "title":"which day of the month ?",
          "condition": "newTask.occurrence=='EVERYMONTH'"


        },

        {
          type: "actions",
          condition:"(newTask.title!=undefined) ",
          items: [
          { type: "button", title: "Cancel", style: "btn-info", onClick: clearForm},
          { type: "submit", title: "Confirm", style: "btn-info" ,icon: "glyphicon glyphicon-icon-exclamation-sign"},
          { type: "button", title: "More details", style: "btn-info", onClick: formNext},
          
          ]
        },

  
      ];
  $scope.taskFormTopic = [ 

          { key : "canupload",
            title : "Support document upload ?"},
          {
            key : "entryfields",
            title : "Any information to collect ?",
            disableSuccessState : true,
            items: [
                    { key: "entryfields[].name", startEmpty: true, disableSuccessState: true, notitle: true },
                    
                  ]
                
            
          },
          {
          "key": "hasStatuses",
          title: "Decisions to end the task ",
    "type": "radios",
    "titleMap": [
    {"value": false, "name": "No decision - task ended being 'done'"},
    {"value": true, "name": "List of decisions"},
     ]
   },
   {
          "key": "endresult",
          condition: "(newTask.hasStatuses==true)",
          title: "what are the possible outcomes ? ",
          items: [
                    { key: "endresult[].label", startEmpty: true, disableSuccessState: true, notitle: true },
                    
                  ]
   },
  {
    type: "actions",
    items: [ 
    { type: "button", title: "Back", style: "btn-info", onClick: formBack},
    { type: "submit", title: "Confirm", style: "btn-info" ,icon: "glyphicon glyphicon-icon-exclamation-sign"},

    ]
  }

];

$scope.taskFormWhen = [
{
  "condition": "(newTask.distribution=='PERSO')",
  "title": "When do you want to work on this task ?",
  "key": "occurrence",
  "type": "select",
  "titleMap": [
  {"value": "NOW", "name": "later"},
  {"value": "DATE", "name": "on date"},
  {"value": "EVERYDAY", "name": "every day"},
  {"value": "EVERYWEEK", "name": "every week"},
  {"value": "EVERYMONTH", "name": "every month"},
  {"value": "ATWILL", "name": "when someone is requesting"},
  {"value": "CHAINED", "name": "when another task is done"},
  ],
  "notitle": false,
  onChange: whenSelected
},
{
  "condition": "(newTask.distribution=='GROUP')",
  "title": "When do you want people to work on this task ?",
  "key": "occurrence",
  "type": "select",
  "titleMap": [
  {"value": "NOW", "name": "asap"},
  {"value": "DATE", "name": "on date"},
  {"value": "EVERYDAY", "name": "every day"},
  {"value": "EVERYWEEK", "name": "every week"},
  {"value": "EVERYMONTH", "name": "every month"},
  {"value": "ATWILL", "name": "when someone is requesting"},
  {"value": "CHAINED", "name": "when another task is done"},
  ],
  "notitle": false,
  onChange: whenSelected
},
{

  "key": "duedate",
  "condition": "newTask.occurrence=='DATE'"
},
{

  "key": "repetitionWeek",
  "title":"which day of the week ?",
  "condition": "newTask.occurrence=='EVERYWEEK'",
  "type": "select",
  "titleMap": [
  {"value": "1", "name": "Monday"},
  {"value": "2", "name": "Tuesday"},
  {"value": "3", "name": "Wednesday"},
  {"value": "4", "name": "Thursday"},
  {"value": "5", "name": "Friday"},
  {"value": "6", "name": "Saturday"},
  {"value": "7", "name": "Sunday"},
  ]
},
{

  "key": "repetitionMonth",
  "title":"which day of the month ?",
  "condition": "newTask.occurrence=='EVERYMONTH'"


},
{
  type: "actions",
  condition:"(newTask.occurrence=='NOW') || (newTask.occurrence=='EVERYDAY') ||(newTask.duedate!=undefined) || (newTask.repetitionWeek!=undefined) || (newTask.repetitionMonth!=undefined)",
  items: [
  { type: "button", title: "back", style: "btn-info", onClick: formBack},
  { type: "submit", title: "Create", style: "btn-info" ,icon: "glyphicon glyphicon-icon-exclamation-sign"},

  ]
},
{
  type: "actions",
  condition:"!((newTask.occurrence=='NOW') || (newTask.occurrence=='EVERYDAY') ||(newTask.duedate!=undefined) || (newTask.repetitionWeek!=undefined) || (newTask.repetitionMonth!=undefined))",
  items: [
  { type: "button", title: "back", style: "btn-info", onClick: formBack},

  ]
}
]

$scope.taskFormAtwill = [
{

  "key": "trigOption",
  "title": "So who can ask me to do this request ?",
  "condition": "newTask.occurrence=='ATWILL'",
  "type": "radios",
  "titleMap": [
  {"value": "PERSO", "name": "Myself"},
  {"value": "GROUP", "name": "Somebody from one of my groups"}
  ],
  onChange: updateExplanation
},
{
  type: "fieldset",
  "condition": "newTask.trigOption=='GROUP'",
  items: [

  {
    "key": "trigGroupId",
    "title": "Specify which group :",

    type: "select",
    titleMap: groupMap,
    onChange: updateExplanation
  },
  {
    "title": "Who in the group ?",
    "key": "trigGroupChoice",
    "condition": "newTask.trigGroupId!=undefined",
    "type": "radios",
    onChange: updateExplanation,
    "titleMap": [
    { "value": "ANY","name": "Anyone in the group" },
    { "value": "ROLE","name": "Anyone with specific role" }
    ]
  },
  {
    "title": "Which role in the group ?" ,
    "key": "trigGroupRole",
    type: "select",
    titleMap: trigGroupRoleMap,
    "condition": "newTask.trigGroupChoice=='ROLE'",
    onChange: updateExplanation  
  }
  ]
},
{
  type: "actions",
  condition: "!((newTask.trigOption=='PERSO') || (newTask.trigGroupChoice=='ANY') || (newTask.trigGroupRole!=undefined))",

  items: [
  { type: "button", title: "back", style: "btn-info", onClick: formBack},

  ]
},
{
  type: "actions",
  condition: "(newTask.trigOption=='PERSO') || (newTask.trigGroupChoice=='ANY') || (newTask.trigGroupRole!=undefined)",
  items: [
  { type: "button", title: "back", style: "btn-info", onClick: formBack},
  { type: "submit", title: "Confirm", style: "btn-info"},
  { type: "button", title: "More details", style: "btn-info", onClick: formNext}

  ]
}

];
        // panel chained tasks
        $scope.taskFormChained = [
        {

          "key": "chainedFrom",
          "title": "Select the event which will trigger this task ",
          "type": "select",
          "titleMap": actionsMap
        },
        {
          type: "actions",
          condition: "(newTask.chainedFrom==undefined)",

          items: [
          { type: "button", title: "back", style: "btn-info", onClick: formBack},

          ]
        },
        {
          type: "actions",
          condition: "(newTask.chainedFrom!=undefined)",
          items: [
          { type: "button", title: "back", style: "btn-info", onClick: formBack},
          { type: "submit", title: "create task", style: "btn-info"},

          ]
        }
        ];



      // add button to the form
      //var actions=
      
      //$scope.newTaskForm.push(actions);
    }
    // retireve todos to init the view 
          // when landing on the page, get all todos and show them
          $http.get('/api/userinfo')
          .success(function(data) {
           if (data.login == true ) {
            $scope.userinfo = data;
            //clearForm();
            init();
          } else {
            $location.path("/");
          }


        })
          .error(function(data) {
            $scope.userinfo={login: false}
            $location.path("/");
            console.log('Error: ' + data);
          });

        }])