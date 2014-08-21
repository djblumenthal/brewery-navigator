$(document).on('ready', function(){

	// on submitting search 
	$('#loc-search-form').on('submit', function(e){
		// prevent page refresh
		e.preventDefault();
		

		
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
		if ((breweryFieldValue == '') && (cityFieldValue == '') && (stateFieldValue == '')){
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
							
							// create Brewery List Item with brewery name
							var breweryLoc = $('<li>').addClass('brewery-location bg-success').html('<span class=brewery-name>' + locData.brewery.name + '</span>').attr({'data-brewerydb-locid': locData.id, 'data-brewerydb-breweryid': locData.breweryId});

							// create brewery phone number description
							var breweryPhone = $('<h6>').addClass('brewery-phone').text('Phone: ' + (locData.phone || 'n/a'));

							// if the brewery has a website, create an anchor tag
							var breweryWebsiteLink;
							if (locData.website){
								breweryWebsiteLink = $('<a>').attr('href', locData.website).text(locData.website);
							}
							else if (locData.brewery.website) {
								breweryWebsiteLink = $('<a>').attr('href', locData.brewery.website).text(locData.brewery.website);
							}
							else {
								breweryWebsiteLink = '';
							}



							// Create get beers button & more brewery info button
							var getBeersButton = $('<button>').addClass('get-beers-button btn btn-warning btn-sm').attr({'type': 'button', 'data-brewerydb-locid': locData.id, 'data-brewerydb-breweryid': locData.breweryId}).text('Beer Menu');
							var moreInfoButton = $('<button>').addClass('get-more-brewery-info-button btn btn-info btn-sm').attr({'type': 'button', 'data-brewerydb-locid': locData.id, 'data-brewerydb-breweryid': locData.breweryId}).text('More Info');
							var breweryButtons = $('<div>').addClass('btn-group brewery-buttons').append([getBeersButton, moreInfoButton]);
							breweryLoc.append([breweryPhone, breweryWebsiteLink, '<br>',breweryButtons]);
							// append the list item & info to the ordered search results list
							searchResultsList.append(breweryLoc);


						}
					}

				}

				// get beer menu
				$('body').on('click', '.get-beers-button', function(){
					$(this).addClass('hide-beers-button').removeClass('get-beers-button').text('Hide Beers');
					
					// hide other beer menus if they're visible to make room for brewery info 
					$('.beer-menu-div').each(function(){
						if ( $(this).css('display') != 'none'){
							$(this).hide();
							var localDivBreweryId = $(this).attr('data-brewerydb-breweryid');
							$('.hide-beers-button[data-brewerydb-breweryid='+localDivBreweryId+']').removeClass('hide-beers-button').addClass('show-beers-button').text('Beer Menu');

						}
					});				

					// hide other brewery info divs
					$('.more-brewery-info-div').each(function(){
						if ( $(this).css('display') != 'none'){
							$(this).hide();
							var localDivBreweryId = $(this).attr('data-brewerydb-breweryid');
							$('.less-brewery-info-button[data-brewerydb-breweryid='+localDivBreweryId+']').removeClass('less-brewery-info-button').addClass('more-brewery-info-button').text('More Info');

						}
					});

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
							for (var i = 0; i < beerMenuData.data.length; i++) {
								var beerChoice = beerMenuData.data[i];
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
								beerMenuList.append(beerChoiceListItem);
							};
						}
					});
					
				});

				// Hide beers menu
				$('body').on('click', '.hide-beers-button', function(){
					$(this).removeClass('hide-beers-button').addClass('show-beers-button').text('Beer Menu');
					var brewerydbBreweryId = $(this).closest('.brewery-location').attr('data-brewerydb-breweryid');
					$('.beer-menu-div[data-brewerydb-breweryid='+brewerydbBreweryId+']').hide();
				});			

				// Show beers Menu (w/o reloading get request)
				$('body').on('click', '.show-beers-button', function(){
					$(this).addClass('hide-beers-button').removeClass('show-beers-button').text('Hide Beers');
					
					// hide other beer menus if they're visible to make room for brewery info 
					$('.beer-menu-div').each(function(){
						if ( $(this).css('display') != 'none'){
							$(this).hide();
							var localDivBreweryId = $(this).attr('data-brewerydb-breweryid');
							$('.hide-beers-button[data-brewerydb-breweryid='+localDivBreweryId+']').removeClass('hide-beers-button').addClass('show-beers-button').text('Beer Menu');

						}
					});				

					// hide other brewery info divs
					$('.more-brewery-info-div').each(function(){
						if ( $(this).css('display') != 'none'){
							$(this).hide();
							var localDivBreweryId = $(this).attr('data-brewerydb-breweryid');
							$('.less-brewery-info-button[data-brewerydb-breweryid='+localDivBreweryId+']').removeClass('less-brewery-info-button').addClass('more-brewery-info-button').text('More Info');

						}
					});

					var brewerydbBreweryId = $(this).closest('.brewery-location').attr('data-brewerydb-breweryid');
					$('.beer-menu-div[data-brewerydb-breweryid='+brewerydbBreweryId+']').show();
				});


				// get more brewery info 
				$('body').on('click', '.get-more-brewery-info-button', function(){
					$(this).addClass('less-brewery-info-button').removeClass('get-more-brewery-info-button').text('Less Info');
					// hide other beer menus if they're visible to make room for brewery info 
					$('.beer-menu-div').each(function(){
						if ( $(this).css('display') != 'none'){
							$(this).hide();
							var localDivBreweryId = $(this).attr('data-brewerydb-breweryid');
							$('.hide-beers-button[data-brewerydb-breweryid='+localDivBreweryId+']').removeClass('hide-beers-button').addClass('show-beers-button').text('Beer Menu');

						}
					});				

					// hide other brewery info divs
					$('.more-brewery-info-div').each(function(){
						if ( $(this).css('display') != 'none'){
							$(this).hide();
							var localDivBreweryId = $(this).attr('data-brewerydb-breweryid');
							$('.less-brewery-info-button[data-brewerydb-breweryid='+localDivBreweryId+']').removeClass('less-brewery-info-button').addClass('more-brewery-info-button').text('More Info');

						}
					});

					var brewerydbLocationId = $(this).closest('.brewery-location').attr('data-brewerydb-locid');
					var brewerydbBreweryId = $(this).closest('.brewery-location').attr('data-brewerydb-breweryid');
					

					for(var i=0; i<returnedLocData.data.length; i++){
						if (returnedLocData.data[i].id == brewerydbLocationId){
							var locData = returnedLocData.data[i];
							var moreBreweryInfoDiv = $('<div>').addClass('more-brewery-info-div bg-info').attr({'data-brewerydb-locid': locData.id, 'data-brewerydb-breweryid': locData.breweryId});
							var breweryAddress = $('<p>').addClass('brewery-address').html(locData.streetAddress + (locData.extendedAddress || '') + '<br>' + locData.locality + ', ' + locData.region + ' ' + locData.postalCode);
							moreBreweryInfoDiv.append(breweryAddress);
							if (locData.hoursOfOperation){
								var breweryHours = $('<p>').addClass('brewery-hours').text(locData.hoursOfOperation);							
								moreBreweryInfoDiv.append(breweryHours);
							}
							if (locData.brewery.description){
								var breweryDescription = $('<p>').addClass('brewery-description').text(locData.brewery.description);
								moreBreweryInfoDiv.append(breweryDescription);
							}
							$(this).closest('.brewery-location').append(moreBreweryInfoDiv);
							
						}
					}
				});
				// hide more brewery info div
				$('body').on('click', '.less-brewery-info-button', function(){
					$(this).addClass('more-brewery-info-button').removeClass('less-brewery-info-button').text('More Info');
					var brewerydbLocationId = $(this).closest('.brewery-location').attr('data-brewerydb-locid');
					$('.more-brewery-info-div[data-brewerydb-locid='+brewerydbLocationId+']').hide();
				});			
				// show more brewery info div
				$('body').on('click', '.more-brewery-info-button', function(){
					$(this).removeClass('more-brewery-info-button').addClass('less-brewery-info-button').text('Less Info');
					
					// hide other beer menu info to make room for brewery info TEST CHANGE!!
					$('.beer-menu-div').each(function(){
						if ( $(this).css('display') != 'none'){
							$(this).hide();
							var localDivBreweryId = $(this).attr('data-brewerydb-breweryid');
							$('.hide-beers-button[data-brewerydb-breweryid='+localDivBreweryId+']').removeClass('hide-beers-button').addClass('show-beers-button').text('Beer Menu');

						}
					});

					// hide other brewery info divs
					$('.more-brewery-info-div').each(function(){
						if ( $(this).css('display') != 'none'){
							$(this).hide();
							var localDivBreweryId = $(this).attr('data-brewerydb-breweryid');
							$('.less-brewery-info-button[data-brewerydb-breweryid='+localDivBreweryId+']').removeClass('less-brewery-info-button').addClass('more-brewery-info-button').text('More Info');

						}
					});


					var brewerydbLocationId = $(this).closest('.brewery-location').attr('data-brewerydb-locid');
					var brewerydbBreweryId = $(this).closest('.brewery-location').attr('data-brewerydb-breweryid')
					$('.more-brewery-info-div[data-brewerydb-locid='+brewerydbLocationId+']').show();

				});
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
								
								var breweryLoc = $('<li>').addClass('brewery-location bg-success').text(breweryData.name).attr({'data-brewerydb-locid': brewerySearchLoc.id, 'data-brewerydb-breweryid': breweryData.id});
								var breweryPhone = $('<h6>').addClass('brewery-phone').text('Phone: ' + brewerySearchLoc.phone);					
								// if there is a website, append it to the brewery info
								var breweryWebsiteLink;
								if (brewerySearchLoc.website){
									breweryWebsiteLink = $('<a>').attr('href', brewerySearchLoc.website).addClass('brewery-website').text(brewerySearchLoc.website);	
								}
								else if (breweryData.website){
									breweryWebsiteLink = $('<a>').attr('href', breweryData.website).addClass('brewery-website').text(breweryData.website);	
								}
								else{
									breweryWebsiteLink = '';
								}
								var getBeersButton = $('<button>').addClass('get-beers-button btn btn-warning btn-sm').attr({'type': 'button', 'data-brewerydb-locid': brewerySearchLoc.id, 'data-brewerydb-breweryid': breweryData.id}).text('Beer Menu');
								var moreInfoButton = $('<button>').addClass('get-more-brewery-info-button btn btn-info btn-sm').attr({'type': 'button', 'data-brewerydb-locid': brewerySearchLoc.id, 'data-brewerydb-breweryid': breweryData.id}).text('More Info');
								var breweryButtons = $('<div>').addClass('btn-group brewery-buttons').append([getBeersButton, moreInfoButton]);
								breweryLoc.append([breweryPhone, breweryWebsiteLink, '<br>', breweryButtons]);
								// append the list item & info to the ordered search results list
								searchResultsList.append(breweryLoc);
								break;
							}

						}
						
					}
				}

				// get beer menu
				$('body').on('click', '.get-beers-button', function(){
					$(this).addClass('hide-beers-button').removeClass('get-beers-button').text('Hide Beers');
					
					// hide other beer menus if they're visible to make room for brewery info 
					$('.beer-menu-div').each(function(){
						if ( $(this).css('display') != 'none'){
							$(this).hide();
							var localDivBreweryId = $(this).attr('data-brewerydb-breweryid');
							$('.hide-beers-button[data-brewerydb-breweryid='+localDivBreweryId+']').removeClass('hide-beers-button').addClass('show-beers-button').text('Beer Menu');

						}
					});				

					// hide other brewery info divs
					$('.more-brewery-info-div').each(function(){
						if ( $(this).css('display') != 'none'){
							$(this).hide();
							var localDivBreweryId = $(this).attr('data-brewerydb-breweryid');
							$('.less-brewery-info-button[data-brewerydb-breweryid='+localDivBreweryId+']').removeClass('less-brewery-info-button').addClass('more-brewery-info-button').text('More Info');

						}
					});

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
							for (var i = 0; i < beerMenuData.data.length; i++) {
								var beerChoice = beerMenuData.data[i];
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
								beerMenuList.append(beerChoiceListItem);
							};
						}
					});
					
				});

				// Hide beers menu
				$('body').on('click', '.hide-beers-button', function(){
					$(this).removeClass('hide-beers-button').addClass('show-beers-button').text('Beer Menu');
					var brewerydbBreweryId = $(this).closest('.brewery-location').attr('data-brewerydb-breweryid');
					$('.beer-menu-div[data-brewerydb-breweryid='+brewerydbBreweryId+']').hide();
				});			

				// Show beers Menu (w/o reloading get request)
				$('body').on('click', '.show-beers-button', function(){
					$(this).addClass('hide-beers-button').removeClass('show-beers-button').text('Hide Beers');
					
					// hide other beer menus if they're visible to make room for brewery info 
					$('.beer-menu-div').each(function(){
						if ( $(this).css('display') != 'none'){
							$(this).hide();
							var localDivBreweryId = $(this).attr('data-brewerydb-breweryid');
							$('.hide-beers-button[data-brewerydb-breweryid='+localDivBreweryId+']').removeClass('hide-beers-button').addClass('show-beers-button').text('Beer Menu');

						}
					});				

					// hide other brewery info divs
					$('.more-brewery-info-div').each(function(){
						if ( $(this).css('display') != 'none'){
							$(this).hide();
							var localDivBreweryId = $(this).attr('data-brewerydb-breweryid');
							$('.less-brewery-info-button[data-brewerydb-breweryid='+localDivBreweryId+']').removeClass('less-brewery-info-button').addClass('more-brewery-info-button').text('More Info');

						}
					});

					var brewerydbBreweryId = $(this).closest('.brewery-location').attr('data-brewerydb-breweryid');
					$('.beer-menu-div[data-brewerydb-breweryid='+brewerydbBreweryId+']').show();
				});


				// get more brewery info 
				$('body').on('click', '.get-more-brewery-info-button', function(){
					$(this).addClass('less-brewery-info-button').removeClass('get-more-brewery-info-button').text('Less Info');
					// hide other beer menus if they're visible to make room for brewery info 
					$('.beer-menu-div').each(function(){
						if ( $(this).css('display') != 'none'){
							$(this).hide();
							var localDivBreweryId = $(this).attr('data-brewerydb-breweryid');
							$('.hide-beers-button[data-brewerydb-breweryid='+localDivBreweryId+']').removeClass('hide-beers-button').addClass('show-beers-button').text('Beer Menu');

						}
					});				

					// hide other brewery info divs
					$('.more-brewery-info-div').each(function(){
						if ( $(this).css('display') != 'none'){
							$(this).hide();
							var localDivBreweryId = $(this).attr('data-brewerydb-breweryid');
							$('.less-brewery-info-button[data-brewerydb-breweryid='+localDivBreweryId+']').removeClass('less-brewery-info-button').addClass('more-brewery-info-button').text('More Info');

						}
					});

					var brewerydbLocationId = $(this).closest('.brewery-location').attr('data-brewerydb-locid');
					var brewerydbBreweryId = $(this).closest('.brewery-location').attr('data-brewerydb-breweryid');
					

					for(var i=0; i<returnedBrewerySearchData.data.length; i++){
						if (returnedBrewerySearchData.data[i].id == brewerydbBreweryId){
							var breweryData = returnedBrewerySearchData.data[i];
							var moreBreweryInfoDiv = $('<div>').addClass('more-brewery-info-div bg-info').attr({'data-brewerydb-locid': brewerydbLocationId, 'data-brewerydb-breweryid': breweryData.id});

							for (var j=0; j<breweryData.locations.length; j++){

								var brewerySearchLoc = breweryData.locations[j];
								
								// grab right location for more info
								if((brewerySearchLoc.isPrimary == 'Y') && (brewerySearchLoc.inPlanning == 'N') && (brewerySearchLoc.isClosed == 'N') && (brewerySearchLoc.openToPublic == 'Y') ) {


									var breweryAddress = $('<p>').addClass('brewery-address').html(brewerySearchLoc.streetAddress + (brewerySearchLoc.extendedAddress || '') + '<br>' + brewerySearchLoc.locality + ', ' + brewerySearchLoc.region + ' ' + brewerySearchLoc.postalCode);
									moreBreweryInfoDiv.append(breweryAddress);
									if (brewerySearchLoc.hoursOfOperation){
										var breweryHours = $('<p>').addClass('brewery-hours').text(brewerySearchLoc.hoursOfOperation);							
										moreBreweryInfoDiv.append(breweryHours);
									}
									if (breweryData.description){
										var breweryDescription = $('<p>').addClass('brewery-description').text(breweryData.description);
										moreBreweryInfoDiv.append(breweryDescription);
									}


								}
								break;
							
							}
							$(this).closest('.brewery-location').append(moreBreweryInfoDiv);
							break;
						}
					}
				});

				// hide more brewery info div
				$('body').on('click', '.less-brewery-info-button', function(){
					$(this).addClass('more-brewery-info-button').removeClass('less-brewery-info-button').text('More Info');
					var brewerydbLocationId = $(this).closest('.brewery-location').attr('data-brewerydb-locid');
					$('.more-brewery-info-div[data-brewerydb-locid='+brewerydbLocationId+']').hide();
				});	

				// show more brewery info div
				$('body').on('click', '.more-brewery-info-button', function(){
					$(this).removeClass('more-brewery-info-button').addClass('less-brewery-info-button').text('Less Info');
					
					// hide other beer menu info to make room for brewery info TEST CHANGE!!
					$('.beer-menu-div').each(function(){
						if ( $(this).css('display') != 'none'){
							$(this).hide();
							var localDivBreweryId = $(this).attr('data-brewerydb-breweryid');
							$('.hide-beers-button[data-brewerydb-breweryid='+localDivBreweryId+']').removeClass('hide-beers-button').addClass('show-beers-button').text('Beer Menu');

						}
					});

					// hide other brewery info divs
					$('.more-brewery-info-div').each(function(){
						if ( $(this).css('display') != 'none'){
							$(this).hide();
							var localDivBreweryId = $(this).attr('data-brewerydb-breweryid');
							$('.less-brewery-info-button[data-brewerydb-breweryid='+localDivBreweryId+']').removeClass('less-brewery-info-button').addClass('more-brewery-info-button').text('More Info');

						}
					});


					var brewerydbLocationId = $(this).closest('.brewery-location').attr('data-brewerydb-locid');
					var brewerydbBreweryId = $(this).closest('.brewery-location').attr('data-brewerydb-breweryid')
					$('.more-brewery-info-div[data-brewerydb-locid='+brewerydbLocationId+']').show();

				});


			});

		}
	});
});