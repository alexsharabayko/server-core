var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var config = require('./config');

var app = express();
var routes = config.routes;

mongoose.connect(config.dbUrl + config.dbName);

app.use(function (req, res, next) {
    var headers = config.customHeaders;

    Object.keys(headers).forEach(function (key) {
        res.header(key, headers[key]);
    });

    next();
});
app.use(bodyParser.json());

Object.keys(routes).forEach(function (key) {
    app.use(key, require('./routes/' + routes[key]));
});

app.listen(config.port);
console.log('Listening port ' + config.port);