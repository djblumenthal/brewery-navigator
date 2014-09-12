Brewery-Navigator (BreweryNav)
=================

brewerynav.herokuapp.com

BreweryNav is a search engine for finding brewery information and details on the beers they brew.  Users can search for breweries by name, city, or state (or any combination of the three), and BreweryNav will list information for that brewery, including location information, hours, website info, a description of the brewery, etc.  Users can also get a list of the beers for a brewery (e.g. type of beer, abv, ibu, description, and availabilty.)   BreweryNav pulls its information from BreweryDB, a massive, crowd-sourced datastore of brewery and beer info.  

BreweryNav is based in node.js, and functions as a single page web application, utilizing AJAX to keep it's search engine fast and render results without refreshing the entire page.  The UI was designed to be lightweight and responsive, and scale seamlessly scales down in mobile browsers.  

Tech Stack:
node.js
express
jquery
ajax
brewerydb api (brewerydb.com)
bootstrap
jade
html5
css3
heroku
mongodb

Features in development:
user authentication & individual user functionality
	- favorite breweries/beers
	- ratings/reviews for breweries/beers
	- google maps integration for getting directions
	- refactor with angular.js
