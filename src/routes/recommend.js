const express   = require('express');
const request   = require('request');
const router    = express.Router();
router.use(express.json());

// Get recommendation from python server
router.get('/:city/:country', (req, res) => {

    //Make get req to python flask server
    request('http://' + process.env.PY_HOST + ':' + process.env.PY_PORT + '/flask/' + req.params.city + "/" + req.params.country, function (error, response, body) {
        console.error('error:', error); // Print the error
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the data received
        res.json({Song: body}); //Display the response on the website
      });
  });

// Export to router
  module.exports = router;
  