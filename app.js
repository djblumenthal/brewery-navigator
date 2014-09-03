var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
// var mongoose = require('mongoose');

var app = express();
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: false}));

var BreweryDb = require('brewerydb-node');
var brewdb = new BreweryDb('ddb63d7628e261264b80157e75be9aea')
var indexControllers = require('./controllers/indexControllers.js');

app.get('/', indexControllers.index);


// search routes
app.get('/locsearch', indexControllers.locSearch);

app.get('/beermenu', indexControllers.beerMenu);

app.get('/brewerysearch', indexControllers.brewerySearch);

var server = app.listen(4790, function() {
	console.log('Express server listening on port ' + server.address().port);
});
