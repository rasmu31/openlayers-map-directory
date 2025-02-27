$(document).ready(function() {
	/*if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('./sw.js')
		.then(function(registration) {
			console.log('Service Worker registered with scope:', registration.scope);
		}).catch(function(error) {
			console.log('Service Worker registration failed:', error);
		});
	}*/
	
	var printError = function(error, explicit) {
		$('#errors_block').show();
		$('#errors_block .error').remove();
		$('#errors_block').append(`<div class="error">[${explicit ? 'EXPLICIT' : 'INEXPLICIT'}] ${error.name}: ${error.message}</div>`);
	}
	
	// Add button to focus list (useful for mobile devices)
	// https://openlayersbook.github.io/ch09-taking-control-of-controls/example-06.html
	// https://openlayers.org/en/latest/examples/custom-controls.html => I use it
	class FocusList extends ol.control.Control {
		constructor(opt_options) {
			const options = opt_options || {};

			const button = document.createElement('button');
			// <i class="fa-solid fa-circle-down"></i> <i class="fa-solid fa-arrow-turn-down"></i>
			button.innerHTML = '<i class="fa-solid fa-angles-down"></i>';

			const element = document.createElement('div');
			element.className = 'focus-list ol-unselectable ol-control';
			element.appendChild(button);

			super({
				element: element,
				target: options.target,
			});
			
			button.addEventListener('click', this.handleFocusList.bind(this), false);
		}

		handleFocusList() {
			var scrollPos =  $("#listInfos").offset().top;
			$(window).scrollTop(scrollPos);
		}
	}

	var newLayer = new ol.layer.Tile({
		source: new ol.source.OSM({
				// url: 'tiles/{z}/{x}/{y}.png'
				// https://stackoverflow.com/questions/67974614/what-is-the-best-approach-to-show-only-a-specific-country-using-openlayers-6
				
		}),
		zIndex: 10,
	});
	
	const franceExtent = ol.proj.transformExtent([-6, 41, 9, 52], 'EPSG:4326', 'EPSG:3857');

	var map = new ol.Map({
		layers: [newLayer],
		controls: ol.control.defaults.defaults({zoom: true}).extend([new FocusList()]),
  		target: 'map',
		view: new ol.View({
			extent: ol.extent.buffer(franceExtent, 100000),
			showFullExtent: true,
			center: ol.proj.transform([2.2936148185068854, 46.574690465180474], 'EPSG:4326', 'EPSG:3857'),
			zoom: 4,
			minZoom: 4,
			maxZoom: 14
		})
	});		
	
	// https://developers.arcgis.com/openlayers/layers/display-a-popup/		
	var pointStyle = new ol.style.Style({
		image: new ol.style.Circle({
			radius: 6,
			fill: new ol.style.Fill({color: [223, 107, 22]}),
			stroke: new ol.style.Stroke({
				color: [223, 107, 22], width: 2
			})
		})
	});
	
	const popup = new Popup();
	map.addOverlay(popup);
	
	var peopleLayer = new ol.layer.Vector({
		style: pointStyle,
		visible: true,
		map: map,
		zIndex: 10,
	});
	
	map.on("click", (event) => {
		const trailheads = map.getFeaturesAtPixel(
			event.pixel,
			{layerFilter: (layer) => layer === peopleLayer,
			hitTolerance: 50
			}
		);
		
		// We center focus, we don't need to focus here
		// map.getView().setCenter(ol.proj.fromLonLat(ol.proj.transform(event.coordinate, 'EPSG:3857', 'EPSG:4326')));
		
		if (trailheads.length > 0) {
			var propertiesTrail = trailheads[0].getProperties();
					
			$(".infoItem").removeClass('selected');
			$('#' + trailheads[0].getId()).addClass('selected');
			
			if (!window.matchMedia("(max-width: 870px)").matches) {
				var scrollPos =  $("#" + trailheads[0].getId()).offset().top;
				$(window).scrollTop(scrollPos);
			}
			
			const name = trailheads[0].get('nom');
			const address = trailheads[0].get('adresse');
			const phone = trailheads[0].get('telephone');
			const mail = trailheads[0].get('mail');
			const others = trailheads[0].get('autres');
			const others_more = trailheads[0].get('autres_plus_texte');
			others_more_text = "";
			if (others_more != undefined)
				others_more_text += '<div class="others_more"><br>' + others_more + '</div>';
			
			popup.show(trailheads[0].getGeometry().getCoordinates(), `<b>${name}</b><br>${address}<br>${phone}<br>${mail}<br>${others}${others_more_text}`);
		}
		else {
			popup.hide();
		}
	});
	
	function loadDatas() {		
		$.get('infos.json').then(function(data) {
			// Load source from json file loaded locally
			try {
				$('#errors_block').hide();
				$('#errors_block .error').remove();
				$('.infoItem').remove();
				
				features = data.features;
				
				// Override id
				for (var i = 0; i < features.length; i++) {
					features[i].id = 'feature' + (i + 1);
				}
				
				var vectorSource = new ol.source.Vector({
					features: new ol.format.GeoJSON().readFeatures(data,{
						featureProjection: 'EPSG:3857'
					})
				}); 
				
				peopleLayer.setSource(vectorSource);
				$('.infoItem').remove();
				popup.hide();
				
				// Populate infos panel from json file
				for (let i = 0; i < data.features.length; i++) {
					const others_more = data.features[i].properties.autres_plus_texte;
					others_more_text = "";
					if (others_more != undefined)
						others_more_text += '<br><a title="Afficher plus d\'informations" href="#" class="read_more nodefault">Plus d\'info</a><div class="others_more">' + others_more + "</div>";
					
					$('#listInfos').append('<div title="Afficher la personne sur la carte" id="' + data.features[i].id + '" class="infoItem">'
					+ data.features[i].properties.nom + "<br>" + data.features[i].properties.adresse + "<br>" + data.features[i].properties.telephone
					+ "<br>" + data.features[i].properties.mail + "<br>" + data.features[i].properties.autres + others_more_text +
					'</div>');
				}
				
				// or use https://gis.stackexchange.com/questions/345426/simulate-click-to-map-on-specific-coordinates-and-layer-in-openlayers
		
				$(".infoItem").click(function(event) {
					// For mobile, we get back to the top
					if (window.matchMedia("(max-width: 870px)").matches) {
						//var scrollPos =  $("body").offset().top;
						//$(window).scrollTop(scrollPos);
						//$('html').scrollTop(0);
						//window.scrollTo(0, 0);
						
						// scrollTop(0) don't work on my mobile (50px from the top), so I use #
						top.location.href = '#';
					}
				
					$(".infoItem").removeClass('selected');
					$(this).addClass('selected');
					
					feature = vectorSource.getFeatureById(this.id);
					const name = feature.get('nom');
					const address = feature.get('adresse');
					const phone = feature.get('telephone');
					const mail = feature.get('mail');
					const others = feature.get('autres');
					const others_more = feature.get('autres_plus_texte');
					others_more_text = "";
					if (others_more != undefined)
						others_more_text += '<div class="others_more"><br>' + others_more + '</div>';
										
					popup.show(feature.getGeometry().getCoordinates(), `<b>${name}</b><br>${address}<br>${phone}<br>${mail}<br>${others}${others_more_text}`);
					
					// We center focus
					map.getView().setCenter(ol.proj.fromLonLat(ol.proj.transform(feature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326')));
				});
				
				// Disable default event (scroll top) when clicking on link with # anchor (nav items ans links with js actions such as clickable tooltips)
				$('a.nodefault').click(function(event) {
					event.preventDefault();
				});
				
				$(".read_more").click(function(event) {
					$(".others_more").hide();
					$(this).next().show();
				});
			}
			catch (e) {
				if (e instanceof SyntaxError) {
					printError(e, true);
				}
				else {
					printError(e, false);
				}
			}
		}).fail(function() {
			printError({name: 'Erreur de fichier', message: 'impossible de charger le fichier contenant les catégories et personnes.'}, false);
		});
	}
		
	// As we need one column layout for mobile, we can't use % for map's height, so we use px
	function fixContentHeight() {
		var viewHeight = $(window).height();
		var contentHeight = viewHeight - 130;
		$('#map').height(contentHeight);
		map.updateSize();
	}
	
	if (window.matchMedia("(max-width: 870px)").matches)
		fixContentHeight();
	
	loadDatas();
	
});