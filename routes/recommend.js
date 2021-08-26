var express = require('express');
var router = express.Router();
const request = require('request');

router.get('/:city/:country', function(req, res, next){


    //Make get req to python flask server
    request('http://127.0.0.1:5000/flask/' + req.params.city + "/" + req.params.country, function (error, response, body) {
        console.error('error:', error); // Print the error
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the data received
        res.json({Song: body}); //Display the response on the website
      });
  });


  module.exports = router
  