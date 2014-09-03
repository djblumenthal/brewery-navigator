var request = require('request');

var indexControllers = {
	index: function(req, res) {
		res.render('index');
	},
	// route to search by location
	locSearch: function(req, res){
		var locSearchQueryURL = 'http://api.brewerydb.com/v2/locations?key=ddb63d7628e261264b80157e75be9aea&locality=' + req.query.locality + '&region=' + req.query.region + '&order=breweryName&isPrimary=Y&inPlanning=N&isClosed=N'; 
		request(locSearchQueryURL, function(error, response, body){ 
			if (!error && response.statusCode == 200){
				res.send(body);
			}
		});
	},
	// route to get beermenu
	beerMenu: function(req, res){
		var beerMenuQueryURL = 'http://api.brewerydb.com/v2/brewery/' + req.query.id + '/beers?key=ddb63d7628e261264b80157e75be9aea';
		request(beerMenuQueryURL, function(error, response, body){
			if (!error && response.statusCode == 200){
				res.send(body);
			}
		});
	},
	brewerySearch: function(req, res){
		var brewerySearchQueryURL = 'http://api.brewerydb.com/v2/search/?key=ddb63d7628e261264b80157e75be9aea&type=brewery&q=' + req.query.q + '&withLocations=Y';
		request(brewerySearchQueryURL, function(error, response, body){
			if (!error && response.statusCode == 200){
				res.send(body);
			}
		});
	}
}
module.exports = indexControllers;