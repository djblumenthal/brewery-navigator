$(document).on('ready', function(){
	// disable other search inputs if location only checked
	$('#location-only').on('click', function(){
		if ($('#location-only').prop('checked')){
			$('#search-field').prop('disabled', true);
			$('#brewery-filter').prop('disabled', true);
			$('#beer-filter').prop('disabled', true);
		}
		else {
			$('#search-field').prop('disabled', false);
			$('#brewery-filter').prop('disabled', false);
			$('#beer-filter').prop('disabled', false);
		}
		
	});

	
	$('#loc-search-form').on('submit', function(e){
		e.preventDefault();
		
		var breweryFieldValue = $('#search-field').val();
		var cityFieldValue = $('#city-field').val();
		var stateFieldValue = $('#state-field').val();
		
		// only allow search when a field has been filled in
		if ((breweryFieldValue == '') && (cityFieldValue == '') && (stateFieldValue == '')){
			$('#error-message').text('Oops!  I need a brewery name (or your best guess), a city, or a state before I can start hunting.');
		}

		// check if it's a location only search
		else if (breweryFieldValue == ''){


			// render location search results
			$.getJSON('/locsearch', {locality: cityFieldValue, region: stateFieldValue}, function(returnedLocData){
				$('#search-results-list').empty();
				// if get request succesful but no locations found, throw error
				$('#error-message').text('');
				if (!returnedLocData.data){
					$('#error-message').text('I can\'t find any breweries in that city or state.  Is that on the moon?  Check your spelling, and use the full state name in your search.  For example, \"Colorado\", not \"CO\".')
				} 
				else {

					for (var i=0; i < returnedLocData.data.length; i++){
						var locData = returnedLocData.data[i];
						// only render breweries that are open to the public
						if ( locData.openToPublic == 'Y'){
							// create Brewery List Item with brewery name
							var breweryLoc = $('<li>').addClass('brewery-location').text(locData.brewery.name).attr({'data-brewerydb-locid': locData.id, 'data-brewerydb-breweryid': locData.breweryId});
							var breweryPhone = $('<h6>').addClass('brewery-phone').text('Phone: ' + locData.phone);
							breweryLoc.append(breweryPhone);					
							// if there is a website, append it to the brewery info
							if (locData.website){
								var breweryWebsite = $('<h6>').addClass('brewery-website').text('Website: ' + locData.website);	
								breweryLoc.append(breweryWebsite);
							}
							if ((!locData.website) && (locData.brewery.website)){
								var breweryWebsite = $('<h6>').addClass('brewery-website').text('Website: ' + locData.brewery.website);
								breweryLoc.append(breweryWebsite);
							}
							var getBeersButton = $('<button>').addClass('get-beers-button').attr({'type': 'button', 'data-brewerydb-locid': locData.id, 'data-brewerydb-breweryid': locData.breweryId}).text('Beer Menu');
							var moreInfoButton = $('<button>').addClass('get-more-brewery-info-button').attr({'type': 'button', 'data-brewerydb-locid': locData.id, 'data-brewerydb-breweryid': locData.breweryId}).text('More Info');
							breweryLoc.append(getBeersButton);
							breweryLoc.append(moreInfoButton);
							// append the list item & info to the ordered search results list
							$('#search-results-list').append(breweryLoc);


						}
					}

				}

				// get beer menu
				$('body').on('click', '.get-beers-button', function(){
					
					// hide other beer menus if they're visible to make room for brewery info 
					$('.beer-menu-div').each(function(){
						if ( $(this).css('display') != 'none'){
							$(this).hide();
							var localDivBreweryId = $(this).attr('data-brewerydb-breweryid')
							$('.hide-beers-button[data-brewerydb-breweryid='+localDivBreweryId+']').toggleClass('hide-beers-button show-beers-button').text('Beer Menu');

						}
					});				

					// hide other brewery info divs
					$('.more-brewery-info-div').each(function(){
						if ( $(this).css('display') != 'none'){
							$(this).hide();
							var localDivBreweryId = $(this).attr('data-brewerydb-breweryid')
							$('.less-brewery-info-button[data-brewerydb-breweryid='+localDivBreweryId+']').toggleClass('less-brewery-info-button more-brewery-info-button').text('More Info');

						}
					});

					$(this).toggleClass('get-beers-button hide-beers-button').text('Hide Beers');
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
								var beerChoiceListItem = $('<li>').addClass('beer-choice-list-item').attr('data-brewerydb-beerid', beerId).text(beerChoice.name);
								var beerChoiceStyle = $('<h6>').addClass('beer-choice-style').attr('data-brewerydb-styleid', beerChoice.styleId).text(beerChoice.style.name);
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
					$(this).toggleClass('hide-beers-button show-beers-button').text('Beer Menu');
					var brewerydbBreweryId = $(this).closest('.brewery-location').attr('data-brewerydb-breweryid');
					$('.beer-menu-div[data-brewerydb-breweryid='+brewerydbBreweryId+']').hide();
				});			

				// Show beers Menu (w/o reloading get request)
				$('body').on('click', '.show-beers-button', function(){
					
					// hide other beer menus if they're visible to make room for brewery info 
					$('.beer-menu-div').each(function(){
						if ( $(this).css('display') != 'none'){
							$(this).hide();
							var localDivBreweryId = $(this).attr('data-brewerydb-breweryid')
							$('.hide-beers-button[data-brewerydb-breweryid='+localDivBreweryId+']').toggleClass('hide-beers-button show-beers-button').text('Beer Menu');

						}
					});				

					// hide other brewery info divs
					$('.more-brewery-info-div').each(function(){
						if ( $(this).css('display') != 'none'){
							$(this).hide();
							var localDivBreweryId = $(this).attr('data-brewerydb-breweryid')
							$('.less-brewery-info-button[data-brewerydb-breweryid='+localDivBreweryId+']').toggleClass('less-brewery-info-button more-brewery-info-button').text('More Info');

						}
					});

					$(this).toggleClass('hide-beers-button show-beers-button').text('Hide Beers');
					var brewerydbBreweryId = $(this).closest('.brewery-location').attr('data-brewerydb-breweryid');
					$('.beer-menu-div[data-brewerydb-breweryid='+brewerydbBreweryId+']').show();
				});


				// get more brewery info 
				$('body').on('click', '.get-more-brewery-info-button', function(){
					// hide other beer menus if they're visible to make room for brewery info 
					$('.beer-menu-div').each(function(){
						if ( $(this).css('display') != 'none'){
							$(this).hide();
							var localDivBreweryId = $(this).attr('data-brewerydb-breweryid')
							$('.hide-beers-button[data-brewerydb-breweryid='+localDivBreweryId+']').toggleClass('hide-beers-button show-beers-button').text('Beer Menu');

						}
					});				

					// hide other brewery info divs
					$('.more-brewery-info-div').each(function(){
						if ( $(this).css('display') != 'none'){
							$(this).hide();
							var localDivBreweryId = $(this).attr('data-brewerydb-breweryid')
							$('.less-brewery-info-button[data-brewerydb-breweryid='+localDivBreweryId+']').toggleClass('less-brewery-info-button more-brewery-info-button').text('More Info');

						}
					});

					$(this).toggleClass('get-more-brewery-info-button less-brewery-info-button').text('Less Info');
					var brewerydbLocationId = $(this).closest('.brewery-location').attr('data-brewerydb-locid');
					var brewerydbBreweryId = $(this).closest('.brewery-location').attr('data-brewerydb-breweryid');
					

					for(var i=0; i<returnedLocData.data.length; i++){
						if (returnedLocData.data[i].id == brewerydbLocationId){
							var locData = returnedLocData.data[i];
							var moreBreweryInfoDiv = $('<div>').addClass('more-brewery-info-div').attr({'data-brewerydb-locid': locData.id, 'data-brewerydb-breweryid': locData.breweryId});
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
					$(this).toggleClass('more-brewery-info-button less-brewery-info-button').text('More Info');
					var brewerydbLocationId = $(this).closest('.brewery-location').attr('data-brewerydb-locid');
					$('.more-brewery-info-div[data-brewerydb-locid='+brewerydbLocationId+']').hide();
				});			
				// show more brewery info div
				$('body').on('click', '.more-brewery-info-button', function(){
					
					// hide other beer menu info to make room for brewery info TEST CHANGE!!
					$('.beer-menu-div').each(function(){
						if ( $(this).css('display') != 'none'){
							$(this).hide();
							var localDivBreweryId = $(this).attr('data-brewerydb-breweryid')
							$('.hide-beers-button[data-brewerydb-breweryid='+localDivBreweryId+']').toggleClass('hide-beers-button show-beers-button').text('Beer Menu');

						}
					});

					// hide other brewery info divs
					$('.more-brewery-info-div').each(function(){
						if ( $(this).css('display') != 'none'){
							$(this).hide();
							var localDivBreweryId = $(this).attr('data-brewerydb-breweryid')
							$('.less-brewery-info-button[data-brewerydb-breweryid='+localDivBreweryId+']').toggleClass('less-brewery-info-button more-brewery-info-button').text('More Info');

						}
					});


					$(this).toggleClass('more-brewery-info-button less-brewery-info-button').text('Less Info');
					var brewerydbLocationId = $(this).closest('.brewery-location').attr('data-brewerydb-locid');
					var brewerydbBreweryId = $(this).closest('.brewery-location').attr('data-brewerydb-breweryid')
					$('.more-brewery-info-div[data-brewerydb-locid='+brewerydbLocationId+']').show();

				});
			});

		}

		else {
			$.getJSON('/brewerysearch', {q: breweryFieldValue}, function(returnedBrewerySearchData){
				$('#search-results-list').empty();
				// if get request succesful but no breweries found, throw error
				$('#error-message').text('');
				if (!returnedBrewerySearchData.data){
					$('#error-message').text('I can\'t find any breweries matching that criteria.  Check your spelling, and if you\'re filtering by state, remember to use the full state name.  For example, \"Colorado\", not \"CO\".')
				} 
				else {
					for (var i=0; i<returnedBrewerySearchData.data.length; i++){
						var brewerySearchLoc = returnedBrewerySearchData.data[i].locations;
						// test for relevant breweries & filter based on user inputed city & state
						if((brewerySearchLoc.isPrimary == 'Y') && (brewerySearchLoc.inPlanning == 'N') && (brewerySearchLoc.isClosed == 'N') && (brewerySearchLoc.openToPublic == 'Y') && (cityFieldValue == (brewerySearchLoc.locality || '')) && (stateFieldValue == (brewerySearchLoc.region || '') )) {



						}
						
					}
				}
			});

		}
	});
});