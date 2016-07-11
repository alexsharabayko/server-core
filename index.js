var express = require('express'),
    app = express(),
    port = 4000,
    mongoose = require('mongoose'),
    bodyParser = require('body-parser');

mongoose.connect('localhost:27017/hellyeahdish');

app.use(allowCrossDomain);

app.use(bodyParser.json());

app.use('/', require('./routes/user-route.js'));

app.listen(port);
console.log('Listening port ' + port);

function allowCrossDomain (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}