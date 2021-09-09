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
  var ip = req.socket.remoteAddress.split(':').pop();
  geoIP.lookup(ip, async (err, data) => {
    if (err) throw err;
    console.log(data);
    res.json({lat : data.location.lat, lng : data.location.lng});
  })
})

// Start listening on port
const port = process.env.API_PORT === undefined ? 8081 : process.env.API_PORT;
app.listen(port, () => console.log('Server started on port ' + port));
