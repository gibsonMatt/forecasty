// Environmental variable configuration
require('dotenv').config({path : __dirname + '/../.env'});

// Module requirements
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());

// Set up routes
const router = require('./routes');
app.use('/api', router);

// Start listening on port
const port = process.env.API_PORT === undefined ? 8081 : process.env.API_PORT;
app.listen(port, () => console.log('Server started on port ' + port));

