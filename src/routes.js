// Module requirements
const express   = require('express');
const router    = express.Router();
const queryDB   = require('./queryDB');
const request   = require('request');
router.use(express.json());

// API setup
const GeoIP = require('simple-geoip');
let geoIP = new GeoIP(process.env.GEOID_API_KEY);


// Test route to verify connection
router.get('/test', async (req, res) => {
    res.status(201).send('Success!');
});

// Test route to return IP address
router.get('/awhoami', async (req, res) => {
    res.json({IP : req.socket.remoteAddress.split(':').pop()})
});

// Test route to return latitude and longitude
router.get('/whereami', async (req, res) => {

    // Get IP address from request header
    var ip = req.socket.remoteAddress.split(':').pop();

    // Look up latitude and longitude from IP address
    geoIP.lookup(ip, async (err, data) => {
        if (err) throw err;

        // TEMP: Log out data packet from geoIP
        console.log(data);

        // Return latitude and longitude
        res.json({lat : data.location.lat, lng : data.location.lng});
    });
});

// Get weather reading from IP
router.get('/weatherfromip', async (req, res) => {

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

            // Unsuccessful HTTP status
            res.status(400).send('IP not located');
        
        } else {

            // If successful, get weather from OWM
            getWeather(lat, lng, async (err, results) => {
                if(err) throw err;

                // TEMP: Print results to console
                console.log(results);

                // Successful HTTP response
                res.status(201).json(results);

            });
        }
    });
});

// Get song recommendation from IP
router.get('/songfromip', async (req, res) => {

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

            // Unsuccessful HTTP status
            res.status(400).send('IP not located');
        
        } else {

            // If successful, get song recommendation
            getSongFromCoords(lat, lng, async (err, results) => {
                if(err) throw err;

                // TEMP: Print results to console
                console.log(results);

                // Successful HTTP response
                res.status(201).json(results);

            });
        }
    });
});

// Get weather reading from latitude and longitude
router.get('/weatherfromcoords', async (req, res) => {
    
    // Unpack coordinates
    lat = req.query.lat;
    lng = req.query.lng;

    // Return error if IP is not a locatable public IP
    if(lat === 0 && lng === 0) {

        // Unsuccessful HTTP status
        res.status(400).send('IP not located');
    
    } else {

        // If successful, get weather from OWM
        getWeather(lat, lng, async (err, results) => {
            if(err) throw err;

            // Successful HTTP response
            res.status(201).json(results);

        });
    }
});

// Get song recommendation from latitude and longitude
router.get('/songfromcoords', async (req, res) => {
    
    // Unpack coordinates
    lat = req.query.lat;
    lng = req.query.lng;

    // Return error if IP is not a locatable public IP
    if(lat === 0 && lng === 0) {

        // Unsuccessful HTTP status
        res.status(400).send('IP not located');
    
    } else {

        // If successful, get song recommendation
        getSongFromCoords(lat, lng, async (err, results) => {
            if(err) throw err;

            // Successful HTTP response
            res.status(201).json(results);

        });
    }
});

// Function to get weather status from OpenWeatherMap API and run callback
getWeather = async (lat, lng, callback) => {

    // Send request to OpenWeatherMap server
    request('http://api.openweathermap.org/data/2.5/weather?' 
    + 'lat=' + lat + '&lon=' + lng + '&appid=' + process.env.OWM_API_KEY,
    async (err, res) => {

        if(!err) {

            // Parse response to JSON
            let body = JSON.parse(res.body);

            // Pass result to callback
            callback(false, {weather : body.weather[0].main});

        }else{

            // Catch error and run callback
            callback(err, {});
        }
    });
}

// Function to get song id from database
getSong = async (weather, callback) => {

    //TODO: IMPROVE CUTOFF SCORE BASED ON SAD WEATHER
    let sadWeatherStatuses = ['thunderstorm', 'drizzle', 'rain', 'snow', 'mist', 'tornado', 'clouds']
    let cutoff = 100;
    let comparator = sadWeatherStatuses.includes(weather.toLowerCase()) ? '<' : '>';

    // Generate query string
    let queryString = `SELECT * FROM songs WHERE compositeMetric ` + comparator + ` ` + cutoff + ` ORDER BY RAND() LIMIT 1;`

    // Query song database
    queryDB.executeQuery(queryString, (err, results) => {

        // Catch error and run callback
        if(!err) {
            callback(false, results);
        }else{
            callback(err, {});
        }
    });
}

// Combined function to get song from coordinates
getSongFromCoords = async (lat, lng, callback) => {

    // Pass to getWeather
    getWeather(lat, lng, (err, results) => {

        // Pass to getSong
        if(!err) {
            getSong(results.weather, callback);
        }else{
            callback(err, {});
        }
    });
}

module.exports = router;