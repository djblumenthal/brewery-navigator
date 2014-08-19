$(document).on('ready', function(){
	$('#loc-search-form').on('submit', function(e){
		e.preventDefault();
		var cityField = $('#city-field').val();
		var stateField = $('#state-field').val();
		// render location search results
		$.getJSON('/locsearch', {locality: cityField, region: stateField}, function(returnedData){
			for (var i=0; i < returnedData.data.length; i++){
				var locData = returnedData.data[i];
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
					var showBeersButton = $('<button>').addClass('show-beers-button').text('Beer Menu');
					var moreInfoButton = $('<button>').addClass('more-brewery-info-button').attr('type', 'button').text('More Info');
					breweryLoc.append(showBeersButton);
					breweryLoc.append(moreInfoButton);
					// append the list item & info to the ordered search results list
					$('#loc-search-results').append(breweryLoc);


				}
			}

			// show beer menu
			$('body').on('click', '.show-beers-button', function(){
				$(this).toggleClass('show-beers-button hide-beers-button').text('Hide Beers');
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

			// add more brewery info 
			$('body').on('click', '.more-brewery-info-button', function(){
				$(this).toggleClass('more-brewery-info-button less-brewery-info-button').text('Less Info');
				var brewerydbLocationId = $(this).closest('.brewery-location').attr('data-brewerydb-locid');
				for(var i=0; i<returnedData.data.length; i++){
					if (returnedData.data[i].id == brewerydbLocationId){
						var locData = returnedData.data[i];
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
			// remove more brewery info div
			$('body').on('click', '.less-brewery-info-button', function(){
				$(this).toggleClass('more-brewery-info-button less-brewery-info-button').text('More Info');
				var brewerydbLocationId = $(this).closest('.brewery-location').attr('data-brewerydb-locid');
				$('.more-brewery-info-div[data-brewerydb-locid='+brewerydbLocationId+']').remove();
			});
		});
	});
});