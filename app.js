var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

var app = express();
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: false}));

var BreweryDb = require('brewerydb-node');
var brewdb = new BreweryDb('ddb63d7628e261264b80157e75be9aea')

app.get('/', function(req, res) {
	res.render('index');
});

app.get('/locsearch', function(req, res){
	var locSearchQueryURL = 'http://api.brewerydb.com/v2/locations?key=ddb63d7628e261264b80157e75be9aea&locality=' + req.query.locality + '&region=' + req.query.region + '&order=breweryName&isPrimary=Y&inPlanning=N&isClosed=N'; 
	console.log(locSearchQueryURL);
	request(locSearchQueryURL, function(error, response, body){ 
		if (!error && response.statusCode == 200){
			res.send(body);
		}
	});

});

app.get('/beermenu', function(req, res){
	var beerMenuQueryURL = 'http://api.brewerydb.com/v2/brewery/' + req.query.id + '/beers?key=ddb63d7628e261264b80157e75be9aea';
	console.log(beerMenuQueryURL);
	request(beerMenuQueryURL, function(error, response, body){
		if (!error && response.statusCode == 200){
			res.send(body);
		}
	});
});

app.get('/brewerysearch', function(req, res){
	var brewerySearchQueryURL = 'http://api.brewerydb.com/v2/search/?key=ddb63d7628e261264b80157e75be9aea&type=brewery&q=' + req.query.q + '&withLocations=Y';
	console.log(brewerySearchQueryURL);
	request(brewerySearchQueryURL, function(error, response, body){
		if (!error && response.statusCode == 200){
			res.send(body);
		}
	});
});

var server = app.listen(4790, function() {
	console.log('Express server listening on port ' + server.address().port);
});
