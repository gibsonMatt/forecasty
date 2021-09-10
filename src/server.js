// Environmental variable configuration
require('dotenv').config({path : __dirname + '/../.env'});

// Module requirements
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());


// Set up routes
const recommendRouter = require('./routes/recommend');
app.use('/api/recommend', recommendRouter);

// Test route to verify connection
app.get('/api/test', async (req, res) => {
  console.log(req.socket.remoteAddress.split(':').pop());
  res.status(201).send('Success!');
});

// Test route to return IP address
app.get('/api/whoami', async (req, res) => {
  res.json({IP : req.socket.remoteAddress.split(':').pop()})
})

// Test route to return latitude and longitude
const GeoIP = require('simple-geoip');
let geoIP = new GeoIP(process.env.GEOID_API_KEY);
app.get('/api/whereami', async (req, res) => {

  // Get IP address from request header
  var ip = req.socket.remoteAddress.split(':').pop();

  // Look up latitude and longitude from IP address
  geoIP.lookup(ip, async (err, data) => {
    if (err) throw err;

    // TEMP: Log out data packet from geoIP
    console.log(data);

    // Return latitude and longitude
    res.json({lat : data.location.lat, lng : data.location.lng});
  })
})

// Test route to get song recommendation from IP
const request = require('request');
app.get('/api/songbycoords', async (req, res) => {

  // Get IP address from request header
  var ip = req.socket.remoteAddress.split(':').pop();
  
  // Look up latitude and longitude from IP address
  geoIP.lookup(ip, async (err, data) => {
    if (err) throw err;

    // TEMP: Log out data packet from geoIP
    console.log(data);

    // Unpack coordinates
    lat = data.location.lat;
    lng = data.location.lng;

    // Return error if IP is not a locatable public IP
    if(lat === 0 && lng === 0) {
      res.status(400).send('IP not located');
    } else {

      // Send request to python server
      request('http://' + process.env.PY_HOST + ':' + process.env.PY_PORT + '/flask/bycoords?lat=' + lat + '&lng=' + lng, (error, response, body) => {
          console.error('error:', error); // Print the error
          console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
          console.log('body:', body); // Print the data received
          res.json({Song: body}); //Display the response on the website
        });
    }
  });
});

// Start listening on port
const port = process.env.API_PORT === undefined ? 8081 : process.env.API_PORT;
app.listen(port, () => console.log('Server started on port ' + port));

