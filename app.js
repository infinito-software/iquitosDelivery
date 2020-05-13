'use strict';

const PORT = 3000;

var express = require('express')
var bodyParser = require('body-parser')
var app = express();
var routes = require('./routes/index')

var publicDir = (__dirname + '/public');

app.use((req, res, next) => {

    res.setHeader('Access-Control-Allow-Headers', 'Content-type', 'Authorization');
    next();
});

app.use(express.static(publicDir));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Configure error handle
app.use(function (err, req, res, next) {

    if (err.name === 'UnauthorizedError')
        res.status(401).send(JSON.stringify({ success: false, message: "Invalid web Token" }));
    else
        next(err);

});

app.use("/", routes);

app.listen(PORT, () => { console.log("IQUITOS DELIVERY API RUNNING") });