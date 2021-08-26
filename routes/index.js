var express = require('express');
var router = express.Router();

//Needs logic for looking up user location

router.get('/', function(req, res, next) {
  res.send("Forecasty")
});



module.exports = router;
