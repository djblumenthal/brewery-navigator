	function BreweryDataObj(breweryId, mainLocationId, name, phone, website, streetAddress, extendedAddress, city, state, zipcode, hours, description){
		this.breweryId = breweryId;
		this.mainLocationId = mainLocationId;
		this.name = name;
		this.phone = phone || 'n/a';
		this.website = website;
		this.streetAddress = streetAddress || '';
		this.extendedAddress = extendedAddress || '';
		this.city = city;
		this.state = state;
		this.zipcode = zipcode;
		this.hours = hours || '';
		this.description = description || '';
		this.beers = [];
	}

	function BeerDataObj(beerData){
		this.beerId = beerData.id;
		this.styleObj = beerData.style || {};
		this.styleId = beerData.styleId || ''; 
		this.name = beerData.name;
		this.abv = beerData.abv || '';
		this.ibu = beerData.ibu || '';
		this.description = beerData.description || '';
		this.available = beerData.available || {};
	}

	var createBreweryListItem = function(breweryDataObj){
		// create Brewery List Item with brewery name
		var breweryLoc = $('<li>').addClass('brewery-location').html('<span class=brewery-name>' + breweryDataObj.name + '</span>').attr({'data-brewerydb-breweryid': breweryDataObj.breweryId});
		
		// create brewery phone number description
		var breweryPhone = $('<h6>').addClass('brewery-phone').text('Phone: ' + breweryDataObj.phone);
		// create Brewery Website element
		var breweryWebsiteLink = $('<a>').attr('href', breweryDataObj.website).text(breweryDataObj.website);

		// Create get beers button & more brewery info button
		var getBeersButton = $('<button>').addClass('get-beers-button btn btn-warning btn-sm').attr({'type': 'button', 'data-brewerydb-breweryid': breweryDataObj.breweryId}).text('Beer Menu');
		var moreInfoButton = $('<button>').addClass('get-more-brewery-info-button btn btn-info btn-sm').attr({'type': 'button', 'data-brewerydb-breweryid': breweryDataObj.breweryId}).text('More Info');
		var breweryButtons = $('<div>').addClass('btn-group brewery-buttons').append([getBeersButton, moreInfoButton]);
		breweryLoc.append([breweryPhone, breweryWebsiteLink, '<br>',breweryButtons]);
		// append the list item & info to the ordered search results list
		return breweryLoc;
	}

	var createBeerChoiceListItem = function(beerChoice){
		var beerId = beerChoice.id;
		var beerChoiceStyleObj = (beerChoice.style || {});
		var beerChoiceListItem = $('<li>').addClass('beer-choice-list-item bg-warning').attr('data-brewerydb-beerid', beerId).text(beerChoice.name);
		var beerChoiceStyle = $('<h6>').addClass('beer-choice-style').attr('data-brewerydb-styleid', beerChoice.styleId).text(beerChoiceStyleObj.name);
		var abvIbuStats = $('<h6>').addClass('abv-ibu-stats').text('ABV: ' + (beerChoice.abv || 'n/a') + '  IBU: ' + (beerChoice.ibu || 'n/a'));
		var beerChoiceDescription = $('<p>').addClass('beer-choice-description').text(beerChoice.description);
		beerChoiceListItem.append(beerChoiceStyle);
		beerChoiceListItem.append(abvIbuStats);
		if (beerChoice.available){
			var availabilityInfo = $('<h6>').addClass('availability-info').text(beerChoice.available.description);
			beerChoiceListItem.append(availabilityInfo);
		}
		beerChoiceListItem.append(beerChoiceDescription);
		return beerChoiceListItem;
	}

	var hideOtherBeerMenus = function(){
		// test if beer menu is visible
		if ( $(this).css('display') != 'none'){
			// hide beer menu
			$(this).hide();
			// capture breweryid associated with this beer menu
			var localDivBreweryId = $(this).attr('data-brewerydb-breweryid');
			// change hide beers button to show beers button
			$('.hide-beers-button[data-brewerydb-breweryid='+localDivBreweryId+']').removeClass('hide-beers-button').addClass('show-beers-button').text('Beer Menu');

		}
	}

	var hideOtherBreweryInfoDivs = function(){
		// test if brewery info div is visible
		if ( $(this).css('display') != 'none'){
			// hide brewery info div
			$(this).hide();
			// capture breweryid associated with this brewery info div
			var localDivBreweryId = $(this).attr('data-brewerydb-breweryid');
			// change less brewery info button to more brewery info button
			$('.less-brewery-info-button[data-brewerydb-breweryid='+localDivBreweryId+']').removeClass('less-brewery-info-button').addClass('more-brewery-info-button').text('More Info');
		}	
	}

	var getBeersButtonHandler = function(){
		
		// change get beers button to hide beers button
		$(this).addClass('hide-beers-button').removeClass('get-beers-button').text('Hide Beers');

		// hide other beer menus if they're visible to make room for brewery info 
		$('.beer-menu-div').each(hideOtherBeerMenus);

		// hide other brewery info divs
		$('.more-brewery-info-div').each(hideOtherBreweryInfoDivs);

		var brewerydbBreweryId = $(this).closest('.brewery-location').attr('data-brewerydb-breweryid');
		var beerMenuDiv = $('<div>').addClass('beer-menu-div').attr('data-brewerydb-breweryid', brewerydbBreweryId);
		var beerMenuList = $('<ol>').addClass('beer-menu-list').attr('data-brewerydb-breweryid', brewerydbBreweryId);
		beerMenuDiv.append(beerMenuList);
		
		$(this).closest('.brewery-location').append(beerMenuDiv);

		$.getJSON('/beermenu', {id: brewerydbBreweryId}, function(beerMenuData){
			if (!beerMenuData.data){
				beerMenuDiv.text('No beer information available :-( ');
			}
			else {
				// find the brewery that makes this beer in the beer results array
				for (var i=0; i<breweryResultsArray.length; i++){
					if (breweryResultsArray[i].breweryId == brewerydbBreweryId){
						// for each beer result returned, create a beer object and push to the beers array in that brewery object
						for (var j = 0; j < beerMenuData.data.length; j++) {
							// create new beer
							var beerChoice = new BeerDataObj(beerMenuData.data[j]);
							// push new beer to beer array in that brewery object
							breweryResultsArray[i].beers.push(beerChoice);
							// create a list item for that beer and append to the beer menu list;
							beerMenuList.append( createBeerChoiceListItem(beerChoice));
						}
						// terminate the brewery search loop once all beers have been added
						break;	
					}
				}
			}
		});
	}

	var hideBeersButtonHandler = function(){
		$(this).removeClass('hide-beers-button').addClass('show-beers-button').text('Beer Menu');
		var brewerydbBreweryId = $(this).closest('.brewery-location').attr('data-brewerydb-breweryid');
		$('.beer-menu-div[data-brewerydb-breweryid='+brewerydbBreweryId+']').hide();
	}

	var showBeersButtonHandler = function(){
		$(this).addClass('hide-beers-button').removeClass('show-beers-button').text('Hide Beers');
		
		// hide other beer menus if they're visible to make room for brewery info 
		$('.beer-menu-div').each(hideOtherBeerMenus);				

		// hide other brewery info divs
		$('.more-brewery-info-div').each(hideOtherBreweryInfoDivs);

		var brewerydbBreweryId = $(this).closest('.brewery-location').attr('data-brewerydb-breweryid');
		$('.beer-menu-div[data-brewerydb-breweryid='+brewerydbBreweryId+']').show();
	}

	var getMoreBreweryInfoButtonHandler = function(){
		$(this).addClass('less-brewery-info-button').removeClass('get-more-brewery-info-button').text('Less Info');
		
		// hide other beer menus if they're visible to make room for brewery info 
		$('.beer-menu-div').each(hideOtherBeerMenus);

		// hide other brewery info divs
		$('.more-brewery-info-div').each(hideOtherBreweryInfoDivs);

		var brewerydbBreweryId = $(this).closest('.brewery-location').attr('data-brewerydb-breweryid');
		
		for(var i=0; i<breweryResultsArray.length; i++){
			if (breweryResultsArray[i].breweryId == brewerydbBreweryId){
				var moreBreweryInfoDiv = $('<div>').addClass('more-brewery-info-div bg-info').attr({'data-brewerydb-locid': breweryResultsArray[i].mainLocationId, 'data-brewerydb-breweryid': breweryResultsArray[i].breweryId});
				var breweryAddress = $('<p>').addClass('brewery-address').html(breweryResultsArray[i].streetAddress + (breweryResultsArray[i].extendedAddress) + '<br>' + breweryResultsArray[i].city + ', ' + breweryResultsArray[i].state + ' ' + breweryResultsArray[i].zipcode);
				moreBreweryInfoDiv.append(breweryAddress);
				
				var breweryHours = $('<p>').addClass('brewery-hours').text(breweryResultsArray[i].hours);							
				moreBreweryInfoDiv.append(breweryHours);
				
				var breweryDescription = $('<p>').addClass('brewery-description').text(breweryResultsArray[i].description);
				moreBreweryInfoDiv.append(breweryDescription);
				$(this).closest('.brewery-location').append(moreBreweryInfoDiv);
				
			}
		}
	}

	var hideMoreBreweryInfoButtonHandler = function(){
		$(this).addClass('more-brewery-info-button').removeClass('less-brewery-info-button').text('More Info');
		var brewerydbBreweryId = $(this).closest('.brewery-location').attr('data-brewerydb-breweryid');
		$('.more-brewery-info-div[data-brewerydb-breweryid='+brewerydbBreweryId+']').hide();
	}

	var showMoreBreweryInfoButtonHandler = function(){
		$(this).removeClass('more-brewery-info-button').addClass('less-brewery-info-button').text('Less Info');
		
		// hide other beer menu info to make room for brewery info 
		$('.beer-menu-div').each(hideOtherBeerMenus);

		// hide other brewery info divs
		$('.more-brewery-info-div').each(hideOtherBreweryInfoDivs);

		var brewerydbBreweryId = $(this).closest('.brewery-location').attr('data-brewerydb-breweryid')
		$('.more-brewery-info-div[data-brewerydb-breweryid='+brewerydbBreweryId+']').show();
	}

var breweryResultsArray = [];

$(document).on('ready', function(){

	$('body').on('click', '.get-beers-button', getBeersButtonHandler);


	// Hide beers menu
	$('body').on('click', '.hide-beers-button', hideBeersButtonHandler);			

	// Show beers Menu (w/o reloading get request)


	$('body').on('click', '.show-beers-button', showBeersButtonHandler);
	
	// get more brewery info 

	$('body').on('click', '.get-more-brewery-info-button', getMoreBreweryInfoButtonHandler);


	// hide more brewery info div
	$('body').on('click', '.less-brewery-info-button', hideMoreBreweryInfoButtonHandler);			

	// show more brewery info div
	$('body').on('click', '.more-brewery-info-button', showMoreBreweryInfoButtonHandler);

	// on submitting search 
	$('#loc-search-form').on('submit', function(e) {
		e.preventDefault();
		breweryResultsArray = [];
		var searchResultsList = $('#search-results-list');
		var breweryFieldValue = $('#brewery-field').val();
		var cityFieldValue = $('#city-field').val();
		var stateFieldValue = $('#state-field').val();
		var errorMessageDiv = $('#error-message-div');

		// hide error message div (if it isn't already hidden)
		errorMessageDiv.hide();

		// clear search results list for new search
		searchResultsList.empty();
		
		// if all search fields are empty, throw error via error div
		if ((breweryFieldValue == '') && (cityFieldValue == '') && (stateFieldValue == '')) {
			errorMessageDiv.text('Oops!  I need a brewery name (or your best guess), a city, or a state before I can start hunting.').show();
		}

		// if only location fields are filled in, search via location route, passing city & state in req body
		else if (breweryFieldValue == ''){
			$.getJSON('/locsearch', {locality: cityFieldValue, region: stateFieldValue}, function(returnedLocData){
				
				// if get request succesful but no locations are found, throw error via error div
				if (!returnedLocData.data){	
					errorMessageDiv.text('I can\'t find any breweries in that city or state.  Is that on the moon?  Check your spelling, and use the full state name in your search.  For example, \"Colorado\", not \"CO\".').show();
				} 

				else {
					// iterate through each location element in the location data array 
					for (var i=0; i < returnedLocData.data.length; i++){
						var locData = returnedLocData.data[i];
						
						// filter out locations closed to the public
						if ( locData.openToPublic == 'Y') {
							
							// define website URL variable
							var breweryWebsiteURL = (locData.website || locData.brewery.website ||'');

							// create new Brewery via constructor

							var locSearchBrewery = new BreweryDataObj(locData.breweryId, locData.id, locData.brewery.name, locData.phone, breweryWebsiteURL, locData.streetAddress, locData.extendedAddress, locData.locality, locData.region, locData.postalCode, locData.hoursOfOperation, locData.brewery.description);

							breweryResultsArray.push(locSearchBrewery);
							// create brewery list item for each locatin and append to search results list
							searchResultsList.append( createBreweryListItem(locSearchBrewery));
							


						}
					}

				}
			});
		}

		else {
			$.getJSON('/brewerysearch', {q: breweryFieldValue}, function(returnedBrewerySearchData){
				// if get request succesful but no breweries found, throw error
				if (!returnedBrewerySearchData.data){

					errorMessageDiv.text('I can\'t find any breweries matching that criteria.  Check your spelling, and if you\'re filtering by state, remember to use the full state name.  For example, \"Colorado\", not \"CO\".').show();
				} 
				else {
					for (var i=0; i<returnedBrewerySearchData.data.length; i++){
						var breweryData = returnedBrewerySearchData.data[i];
						for (var j=0; j<breweryData.locations.length; j++){

							var brewerySearchLoc = breweryData.locations[j];
							// test for relevant breweries & filter based on user inputed city & state
							if((brewerySearchLoc.isPrimary == 'Y') && (brewerySearchLoc.inPlanning == 'N') && (brewerySearchLoc.isClosed == 'N') && (brewerySearchLoc.openToPublic == 'Y') && ((cityFieldValue == brewerySearchLoc.locality) || (cityFieldValue == '')) && ((stateFieldValue == brewerySearchLoc.region) || (stateFieldValue == '') )) {

							// 	// Adding render functionality to Brewery Search
								

								// define website URL variable
								var breweryWebsiteURL = (brewerySearchLoc.website || breweryData.website || '');

								// define new brewery data object from brewery search
								var brewerySearchBrewery = new BreweryDataObj(breweryData.id, brewerySearchLoc.id, breweryData.name, brewerySearchLoc.phone, breweryWebsiteURL, brewerySearchLoc.streetAddress, brewerySearchLoc.extendedAddress, brewerySearchLoc.locality, brewerySearchLoc.region, brewerySearchLoc.postalCode, brewerySearchLoc.hoursOfOperation, breweryData.description);

								breweryResultsArray.push(brewerySearchBrewery);

								// create brewery list item for each locatin and append to search results list
								searchResultsList.append( createBreweryListItem(brewerySearchBrewery));

								break;
							}
						}		
					}
				}
			});
		}

/* Adding pagination (WIP)
		// render brewery search results list
		if (breweryResultsArray.length != 0){
			// if search returned 10 or fewer items, render each brewery in the list
			if (breweryResultsArray.length <= 10){
				for (var i = 0; i < breweryResultsArray.length; i++) {
					searchResultsList.append( createBreweryListItem(breweryResultsArray[i]));
				}
			}

			else {
				for (var i=0; i<breweryResultsArray.length; i++){
					if (i<10){
						searchResultsList.append( createBreweryListItem(breweryResultsArray[i]));
					}
				}
				
			}

		}*/


	});
});