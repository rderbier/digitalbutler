
// command interpreter


module.exports = function (user,command, db, res) {
      var response ={};
        response.getit=false;
             response.page="";
             response.message="can't do that";
            // is in  use case   
    var isin=command.match(/([\w|\s]*) is in ([\w|\s]*)/i);
        console.log("isin match "+isin);
        if(isin!=null) {
            var asset=isin[1];
            var location=isin[2];
            console.log("is in match "+asset+" "+location);
                       
                     var query = [
                    'MATCH (o:OBJECT {createdby:{createdby},name:{asset}})-[r:ISIN]-() DELETE r WITH count(*) as C merge (o:OBJECT {createdby:{createdby},name:{asset}})-[r2:ISIN]-(l2:LOCATION {createdby:{createdby},name:{location}}) return o,r2,l2'
         ].join('\n');
             response.page="location";
             response.message="Where is "+asset;
             response.getit=true;
          db.query(query, {createdby: user.email, asset: asset, location : location} , function(err, todo) {
                
              res.json(response);
            });

             
             
        }
        // CREATE GROUP
        var match=command.match(/[\w\s]*create group ([\w\s]+)/i);
        if(match!=null) {
            var group=match[1].trim();
            
                       
         var query = [
         'MATCH (u:USER) WHERE id(u)={userid}',
         'MERGE (u)-[r:MEMBER]-(t:GROUP {createdby:{createdby}, name:{group}})',
         'RETURN t'
         ].join('\n');
             response.page="groups";
             
             response.getit=true;
          db.query(query, {createdby: user.email, userid: user.id, group: group } , function(err, result) {
          	  if (result.length > 0) {
                  response.message="OK. you can 'invite' people to join this group";
              } else {
              	response.message=" Something went wrong ...";
              }
              res.json(response);
            });

             
             
        }
        // WHERE IS
        var whereis=command.match(/[\w\s]*where is ([\w\s]+)/i);
        if(whereis!=null) {
            var asset=whereis[1].trim();
            
                       
            var query = [
                    'match (o:OBJECT {createdby:{createdby},name:{asset}})-[ISIN]-(l:LOCATION) return l'
            ].join('\n');
             response.page="location";
             
             response.getit=true;
          db.query(query, {createdby: user.email, asset: asset, location : location} , function(err, location) {
          	  if (location.length > 0) {
                  response.message=asset+" is in "+location[0].name; 
              } else {
              	response.message=" dont know where it is, sorry ! Did you tell me ?";
              }
              res.json(response);
            });

             
             
        }
                // to do list 
             
        var match=command.match(/to\s*do([\w\s]*)/i);
        if (match) {
             response.page="todos";
             response.message="";
             response.getit=true;
             res.json(response);
             }
// HAVE TO use case
        if (command.startsWith("have to")) {
            var description = command.substr(8);
                     var query = [
         'MATCH (u:USER) WHERE id(u)={userid}',
         'MERGE (u)-[r:MAYDO]-(t:TODO {createdby:{createdby}, description:{description}, done: false})',
         'RETURN t'
         ].join('\n');
             response.page="todos";
             response.message="";
             response.getit=true;
          db.query(query, {createdby: user.email, userid: user.id, description : description} , function(err, todo) {

             res.json(response);
            });

             
             
        } 
        if (response.getit==false) 
        	res.json(response);
}
