'use strict';

var SparkPost = require('sparkpost');
var sparky = new SparkPost(); // uses process.env.SPARKPOST_API_KEY
console.log(" sending domain "+process.env.SPARKPOST_SANDBOX_DOMAIN);

sparky.transmissions.send({
    content: {
      from: {email:'testing@digitalbutlerservice.com'}, // 'testing@sparkpostbox.com'
      subject: 'Hello, World!',
      html:'<html><body><p>Notification.</p></body></html>'
    },
    recipients: [
      {address: { email:'rderbier@gmail.com'}}
    ]
  })
  .then(data => {
    console.log('Woohoo! You just sent your first mailing!');
    console.log(data);
  })
  .catch(err => {
    console.log('Whoops! Something went wrong');
    console.log(err);
  });



